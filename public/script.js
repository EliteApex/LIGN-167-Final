

// display word to transcribe
// param: string word
function displayWord(word){
    document.getElementById('wordDisplay').innerText = "Transcribe \"" + word + "\"";
}

// display feedback from gpt
// param: string feedback
function displayFeedback(feedback){
    var feedbackElement = document.getElementById('feedback');
    feedbackElement.innerText = "GPT's feedback: " + feedback;
    feedbackElement.style.display = 'block'; // Make the feedback box visible
}


// actually getting the gpt feedback now


var currWord = '';
var currWillTransc = '';

var correctFeedback = 'Great job! Your transcription matches perfectly with Will\'s. ' +
'It seems like you have a solid understanding of the IPA symbols and their corresponding sounds. Keep up the good work!';
var button = document.querySelector('button'); // assumes only one button

// get the initial word
fetch('/next-word')
  .then(response => response.json())
  .then(data => {

    currWord = data[0];
    currWillTransc = data[1];

    console.log('New Word:', currWord);
    console.log('New Transcription:', currWillTransc);
    displayWord(currWord); // oh boy! new word!
  })
  .catch(error => {
    console.error('Error fetching the next word:', error);
  });

var gotCorrect = false; // track whether to move onto the next word

// SUBMIT or NEXT WORD button clicked (or ENTER pressed)
document.getElementById('textForm').addEventListener('submit', function(e) {
    e.preventDefault();
    //button.style.backgroundColor = '#9e41c9';
    //button.textContent = 'Submit';


    var textInput = document.getElementById('textInput');
    var formData = new URLSearchParams();
    formData.append('textInput', textInput.value);

    fetch('/submit-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    })
    .then(response => response.text())
    .then(data => {
        // ******UPON SUBMIT: Crucial content
        console.log("DATA: ", data);

        // moving onto next word
        if (gotCorrect){
            button.classList.remove('button-green');
            button.textContent = 'Submit';

            gotCorrect = false; // reset

            // getNextWord
            fetch('/next-word')
                .then(response => response.json())
                .then(data => {

                    currWord = data[0];
                    currWillTransc = data[1];

                    console.log('New Word:', currWord);
                    console.log('New Transcription:', currWillTransc);
                    displayWord(currWord); // oh boy! new word!
                    
                    // make feedback box invisible
                    var feedbackElement = document.getElementById('feedback');
                    feedbackElement.style.display = 'none';
                
                })
                .catch(error => {
                    console.error('Error fetching the next word:', error);
                });            
        }   
        else {  // text submitted

            // if correct, set correct, display hardcoded message
            if (data === currWillTransc) {
                console.log("CORRECT");
                gotCorrect = true;
                console.log('Feedback:', correctFeedback);
                displayFeedback(correctFeedback); // display feedback
                // change button message + color
                button.classList.add('button-green');
                button.textContent = 'Next Word!';
            }
            else {
                console.log("INCORRECT")
                console.log(currWord, currWillTransc, data); // Debugging line
                displayFeedback("..."); // Update and show the feedback

                fetch('/feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        word: currWord,
                        willsTranscription: currWillTransc,
                        studentsTranscription: data
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Feedback:', data.feedback);
                    displayFeedback(data.feedback); // display feedback
                })
                .catch(error => {
                    console.error('Error:', error);
                });
    
            }
        }
    });

    // clear input box when submit presssed
    textInput.value = '';
});

const ipaSymbols1 = [
    "ɓ", "ʙ", "β", "ɕ", "ç", "ɗ", "ɖ", "ð", "ʤ", "ɟ", "ʄ", "ɡ", "ɠ", "ɢ", "ʛ",
    "ɦ", "ɧ", "ħ", "ʜ", "ʝ", "ɭ", "ɬ", "ɫ", "ɮ", "ʟ", "ʎ", "ɱ", "ɰ",
    "ŋ", "ɳ", "ɲ", "ɴ", "ɸ", "ɹ", "ɻ", "ɺ", "ɾ", "ɽ", "ʀ", "ʁ",
    "ʂ", "ʃ", "θ", "ʈ", "ʧ", "ʋ", "ɣ", "ʍ", "χ", "ʑ", "ʐ", "ʒ"
];

const ipaSymbols2 = [
    "ɑ", "ɐ", "ɒ", "æ", "ə", "ɘ", "ɵ", "ɚ", "ɛ", "ɜ", "ɝ", "ɞ",
    "ɨ", "ɪ", "ɔ", "ø", "œ", "ɶ", "ɥ", "ʌ", "ʊ", "ʉ", "ɯ", "ɤ", "ʏ"
];

// Add the remaining symbols to this array
const ipaSymbols3 = ["ˈ", "ˌ", "ː", "ˑ",  "˘", ".", "‖", "‿"];

function createButtons(symbols, keyboardId) {
    const keyboard = document.getElementById(keyboardId);
    symbols.forEach(symbol => {
        const button = document.createElement('button');
        button.textContent = symbol;
        button.onclick = () => insertSymbol(symbol);
        keyboard.appendChild(button);
    });
}

function insertSymbol(symbol) {
    const input = document.getElementById('textInput');
    input.value += symbol;
}

createButtons(ipaSymbols1, 'ipaKeyboard1');
createButtons(ipaSymbols2, 'ipaKeyboard2');
createButtons(ipaSymbols3, 'ipaKeyboard3');

// Example to display a word (this part can be dynamic)
//displayWord("funny");


// get the feedback!