const questionOne = document.getElementById("question-one")
const questionTwo = document.getElementById("question-two")
const questionThree = document.getElementById("question-three")
const main = document.getElementById("main")

// Simple client-side validation and submit
document.addEventListener("submit", async e => {
    if(e.target.id === "user-info-form"){
        e.preventDefault()
        
        const form = e.target;
        const questionOne = form.querySelector("#question-one").value.trim();
        const questionTwo = form.querySelector("#question-two").value.trim();
        const questionThree = form.querySelector("#question-three").value.trim();

        const payload = { questionOne, questionTwo, questionThree };

        if (!questionOne || !questionTwo || !questionThree) {
        alert('Please fill out all questions before submitting.');
        return;
        }


        try {
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await response.json()
            console.log("forntend data", data)

            if (!response.ok) {
                console.error('Server error:', data)
                alert(data.error || 'Server returned an error. Check the server logs.')
                return
            }

            main.innerHTML = `
                <div class="content">
                    <h2 class="movie-title">${data.title} (${data.releaseyear})</h2>
                    <p class="movie-description">${data.recommendation}</p>
                </div>
                <button type="button" id="restart-btn">Go Again</button>
            `


        } catch (error) {
            console.log('Error:', error)
            alert('Could not reach the server. Is it running on http://localhost:3000 ?')
        }
    }
})

document.addEventListener('click', (e) => {
     if (e.target.id === 'restart-btn') {
    main.innerHTML = `
                <form id="user-info-form">
                    <label for="question-one">What’s your favorite movie and why?</label>
                    <textarea id="question-one"></textarea>
                    <label for="question-two">Are you in the mood for something
                        new or a classic?</label>
                    <textarea id="question-two"></textarea>
                    <label for="question-three">Do you wanna have fun or do you want something serious?</label>
                    <textarea id="question-three"></textarea>
                    <button type="submit">Lets's Go</button>
                </form>
    `
  }
})
