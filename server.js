import { openai, supabase, tmdb } from "./config.js"
import express from "express"
import movies from "./content.js"

const app = express()

app.use(express.json())
app.use(express.static("public"))

app.post("/api/ask", async (req, res) => {
  try {
    const userInput = `
        What’s your favorite movie and why? Answer: ${req.body.questionOne}
        Are you in the mood for something new or a classic? Answer: ${req.body.questionTwo}
        Do you wanna have fun or do you want something serious? Answer: ${req.body.questionThree}
    `
      .replace(/\s+/g, " ")
      .trim()
    // console.log(userInput)
    const userEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: userInput,
    });
    const userEmbedding = userEmbeddingResponse.data[0].embedding;
    console.log("Calling match_films RPC...");
    const { data, error } = await supabase.rpc("match_films", {
      query_embedding: userEmbedding,
      match_threshold: 0.60,
      match_count: 1,
    });
    console.log("✅ RPC finished")

    if(!data || data.length === 0){
        console.log("No matching films found.")
        return res.status(404).json({ error: "No matching films found."})
    }

    const bestMatch = data[0]
    console.log("bestmach", bestMatch)

    const posterUrl = await getMoviePoster(bestMatch.title)
    console.log(posterUrl)

    const messages = [
      {
        role: "system",
        content: "You are a helpful movie recommendation assistant.",
      },
      {
        role: "user",
        content: `
            The user answered: ${userInput}.
            Based on that, you matched the movie "${bestMatch.content}".
            Write one short, fun sentence recommending this movie.
        `,
      },
    ];

    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-4",
      temperature: 0.5,
      frequency_penalty: 0.5,
    })
    // console.log(completion.choices[0]);
    const recommendationText = completion.choices[0].message.content;

    res.json({
      title: bestMatch.title,
      releaseYear: bestMatch.releaseyear,
      recommendation: recommendationText,
      posterUrl: posterUrl
    })
  } catch (error) {
    console.error("An error has occured:" + error)
    res.status(500).json({ error: error.message })
  }
});

async function createMovieEmbeddingAndSave() {
  try {
    for (const movie of movies) {
      const { data: existing, error: checkError } = await supabase
        .from("films")
        .select("id")
        .eq("title", movie.title)
        .maybeSingle()

      if (checkError) throw checkError

      if (existing) {
        console.log(`Skipping "${movie.title}" (already exists)`)
        continue
      }

      const movieEmbeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: movie.content,
      });
      
     const movieEmbedding = movieEmbeddingResponse.data[0].embedding
      console.log(movieEmbedding)
      

      const { data, error } = await supabase.from("films").insert({
        title: movie.title,
        releaseyear: movie.releaseYear,
        content: movie.content,
        embedding: movieEmbedding ,
      });

      if (error) throw error;
    }
  } catch (error) {
    console.error("Error inserting movies:", error);
    throw error;
  }
}

async function getMoviePoster(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdb}&query=${encodeURIComponent(query)}`

    try{
        const res = await fetch(url)
        if(!res.ok) throw new Error(`TMDB request failed: ${res.status}`)
        
        const json = await res.json()

        if(!json.results || json.results.length === 0){
            console.warn("No movie found for query:", query)
            return null
        }
        
        const movie = json.results[0]
        console.log(movie)

        if(movie.poster_path) {
            return `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        }else {
            console.warn("Movie found but no poster available:", movie.title)
            return null
        }
    }
    catch(error){
        console.error('TMDB search error:', error)
        return null
    }

}

async function startServer() {
  await createMovieEmbeddingAndSave()
    .then(() => console.log("🎬 All movies inserted!"))
    .catch((err) => {
      console.error("Movie insert failed, shutting down:", err);
      process.exit(1); 
    });

  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

startServer();