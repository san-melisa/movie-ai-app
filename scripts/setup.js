import { openai, supabase } from "../netlify/functions/config.js";
import movies from "../content.js";

async function createMovieEmbeddingAndSave() {
  try {
    for (const movie of movies) {
      const { data: existing } = await supabase
        .from("films")
        .select("id")
        .eq("title", movie.title)
        .maybeSingle();

      if (existing) {
        console.log(`Skipping "${movie.title}" (already exists)`);
        continue;
      }

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: movie.content,
      });

      const embedding = embeddingResponse.data[0].embedding;

      await supabase.from("films").insert({
        title: movie.title,
        releaseyear: movie.releaseYear,
        content: movie.content,
        embedding: embedding,
      });

      console.log(`✅ Inserted "${movie.title}"`);
    }

    console.log("🎬 All movies inserted!");
  } catch (err) {
    console.error("Error inserting movies:", err);
  }
}

createMovieEmbeddingAndSave();
