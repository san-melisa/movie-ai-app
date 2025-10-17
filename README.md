# Movie AI App 🎬🤖

**Movie AI App** is an intelligent movie recommendation assistant powered by OpenAI and Supabase. It allows users to get personalized movie suggestions based on their preferences and mood, complete with movie posters and fun descriptions.

**Live Demo:** [https://movie-ai-app1.netlify.app/](https://movie-ai-app1.netlify.app/)  
**Design Prototype:** [Figma Link](https://www.figma.com/design/udzKM2FK6ZSMENGZ5QPUhe/PopChoice?node-id=0-1&p=f&t=RLOa69Y9VXeFgzRZ-0)

---

## Features ✨

* Converts all movies in `content.js` into **vector embeddings** and stores them in Supabase.  
* Combines user answers from multiple questions into a single vector for comparison.  
* Uses **Supabase RPC** to find movies similar to the user’s preferences.  
* Generates **fun, personalized movie descriptions** with OpenAI Chat Completions.  
* Fetches **movie posters** automatically from [TMDB](https://www.themoviedb.org/) for a rich visual experience.  
* Provides an intuitive and interactive interface for discovering movies.
* **Responsive design** works seamlessly on desktop, tablet, and mobile devices.


---

## Technologies Used 🛠️

* **Frontend:** HTML, CSS, JavaScript  
* **Backend:** Node.js + OpenAI API + Supabase (vector DB + RPC)  
* **Movie Data & Posters:** [TMDB API](https://www.themoviedb.org/)  
* **Deployment:** [Netlify](https://www.netlify.com/)  
* **Design:** Figma  
