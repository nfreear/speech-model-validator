/*!
  Run some validation checks on Azure custom speech model files, before upload!

  NDF / 28-Oct-2019.

  https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-custom-speech-test-data#audio--human-labeled-transcript-data-for-testingtraining
  https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-custom-speech-human-labeled-transcriptions
  https://speech.microsoft.com/customspeech
*/

const stripBom = require('strip-bom');
const FS = require('fs');
const path = require('path');

require('dotenv').config();
// import { config } from 'dotenv';

const TRANSCRIPT_FILE = process.env.TRANSCRIPT_FILE;
const MODEL_DIR = path.dirname(TRANSCRIPT_FILE);
const TRANSCRIPT_REGEX = /^(\w[\w\-_]+\d+\.wav)\t(\w[\w\', ]+)$/;
const BLANK = /^$/;

const transcript = FS.readFileSync(TRANSCRIPT_FILE, { encoding: 'utf8' });
const noBom = stripBom(transcript);

console.log('Transcript:', TRANSCRIPT_FILE);

let success = [];
let error   = [];

if (transcript === noBom) {
  error.push('Error? No BOM found (not stripped/ matches).');
} else {
  success.push('OK. A BOM was found (stripped).')
}

const LINES = noBom.toString().split("\n");

for (let idx in LINES) {
  let m_transcript = LINES[ idx ].match(TRANSCRIPT_REGEX);

  if (BLANK.test(LINES[ idx ])) {
    // Ignore end of file.
  }
  else if (m_transcript) {
    let wavFile = path.join(MODEL_DIR, m_transcript[ 1 ]);
    let text = m_transcript[ 2 ];

    if (FS.existsSync(wavFile)) {
      success.push(idx + ': OK. ' + LINES[ idx ]);
    } else {
      error.push(idx + ': Error. WAV file doesn\'t exist - ' + wavFile);
    }
  } else {
    error.push(idx + ': Error. Parsing line - ' + LINES[ idx ]);
  }
}

console.log('Successes:', success);
console.error('Errors:', error);

// https://stackoverflow.com/Questions/17879198/Adding-utf-8-bom-to-string-blob
function addTranscriptBom(file, transcript) {
  return FS.writeFileSync(file, '\ufeff' + transcript, { encoding: 'utf8' });
}

// Sed: https://stackoverflow.com/questions/3127436/adding-bom-to-utf-8-files
// sed -i '1s/^\(\xef\xbb\xbf\)\?/\xef\xbb\xbf/' PATH/TO/TRANSCRIPT/*.txt

// End.
