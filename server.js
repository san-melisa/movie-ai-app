import { openai, supabase } from './config.js';
import express from 'express';
import movies from './content.js'

const app = express()

app.use(express.json())
app.use(express.static("public"))

app.post("/api/ask", async (req, res) => {
    try {
        const userInput = `
        What’s your favorite movie and why? Answer: ${req.body.questionOne}
        Are you in the mood for something new or a classic? Answer: ${req.body.questionTwo}
        Do you wanna have fun or do you want something serious? Answer: ${req.body.questionThree}
    `.replace(/\s+/g, ' ').trim();
    
    const userEmbedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: userInput
    })
    const userVector = userEmbedding.data[0].embedding;
    console.log("userVector created:", userVector.length);

    const { data: matches, error } = await supabase.rpc('match_films', {
        query_embedding: userVector,
        match_threshold: 0.60,
        match_count: 1
    })
    console.log(matches)

    if(error) throw error
    if (!matches || matches.length === 0) {
    return res.status(404).json({ error: "No matching films found." });
    }
    const bestMatch = matches[0]
    console.log(bestMatch)
    const messages = [
    { 
        role: "system" ,
        content: "You are a helpful movie recommendation assistant."
    },
    {
        role: "user",
        content: `
            The user answered: ${userInput}.
            Based on that, you matched the movie "${bestMatch}".
            Write one short, fun sentence recommending this movie.
        `
    }
    ]

    const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-4.1-nano",
        temperature: 0.5,
        frequency_penalty: 0.5
    })
    console.log(completion.choices[0])
    const recommendationText = completion.choices[0].message.content;



    res.json({
        title: bestMatch.title,
        releaseYear: bestMatch.releaseYear,
        recommendation: recommendationText

        });

    }
    catch(error) {
        console.error("An error has occured:" + error)
        res.status(500).json({ error: error.message })
    }
})

async function createMovieEmbeddingAndSave() {
    try {
        for(const movie of movies) {
            const { data: existing, error: checkError } = await supabase
                .from("films")
                .select("id")
                .eq("title", movie.title)
                .maybeSingle()
            
            if(checkError) throw checkError

            if(existing) {
                console.log(`Skipping "${movie.title}" (already exists)`);
                continue;
            }


            const movieEmbedding = await openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: movie.content
            })


            const { data, error} = await supabase.from('films').insert({
                title: movie.title,
                releaseyear: movie.releaseYear,
                content: movie.content,
                embedding: movieEmbedding.data[0].embedding
            }) 

            if(error) throw error

    }
    }
    catch(error) {
        console.error("Error inserting movies:", error);
        throw error;
    }
    
}

app.listen(3000, async () => {
     console.log("Server running on http://localhost:3000")

    createMovieEmbeddingAndSave()
        .then(() => console.log("🎬 All movies inserted!"))
        .catch(err => console.error("Movie insert failed:", err));

  
})
