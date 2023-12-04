var pub_key = prompt("Please enter the public key");
// pub_key = '';
// 
const SECRET = 'secret_key'+pub_key //Change this every change password schedule

const cap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const low = 'abcdefghijklmnopqrstuvwxyz';
const num = '0123456789';
const spcChar = '!_*^@$';
const randomCat = [cap, low, num, spcChar];


function cleartables(tableId){
     // clear table before populating with new data
    var table = document.getElementById(tableId);
    for(var i = 1;i<table.rows.length;){
        table.deleteRow(i);
    }
}

function handleEncryption(string) {
    return CryptoJS.AES.encrypt(string, SECRET).toString();
}

function handlePopulateTable(text_arr, enc_arr, tableId) {
    thead = document.getElementById(tableId);

    for (let i = 0; i < enc_arr.length; i++) {
        newRow = thead.insertRow();
        newRow.innerHTML = "<th scope='row'>"+ text_arr[i] +"</th><td>"+enc_arr[i] +"</td>";
    }
}

function handleEncrypt() {
    cleartables('table_head')
    var text = document.getElementById("to_encrypt").value;
    textSplit = text.split(/\r?\n/)

    encArray = [];
    
    for (let d = 0; d < textSplit.length; d++) {
        if(textSplit[d] != '' || textSplit[d] != null){
            encryptedHash = handleEncryption(textSplit[d]);
            encArray.push(encryptedHash);
        }
    }

    localStorage.setItem("encryption", JSON.stringify(encArray));
    
    data = JSON.parse(localStorage.getItem('encryption'));

    exceldata = data.join("\n");

    excelOutput = document.getElementById("csv_output");

    excelOutput.textContent = exceldata;

    handlePopulateTable(textSplit, encArray, 'table_head');
}

function handleDecrypt() {
    var encoded = document.getElementById('to_decrypt').value;
    var targetInputField = document.getElementById('decrypted_display');

    decoded_bytes = CryptoJS.AES.decrypt(encoded, SECRET);
    decoded_string = decoded_bytes.toString(CryptoJS.enc.Utf8);
    targetInputField.value = decoded_string;
}

function toggleDisabled(btnId) {
    var copyBtn = document.getElementById(btnId);
    copyBtn.classList.add('btn-success');
    copyBtn.classList.remove('disabled');
    copyBtn.innerHTML = 'Copy to Clipboard';

}

function handleCopy(btnId, outputElement){
    var copyBtn = document.getElementById(btnId);

    excelOutput = document.getElementById(outputElement);

    navigator.clipboard.writeText(excelOutput.value);

    copyBtn.classList.remove('btn-success');
    copyBtn.classList.add('disabled');
    copyBtn.innerHTML = 'Copied to Clipboard!';

    setTimeout(toggleDisabled, "1000", btnId);
}

async function handleRemoveDuplicates(pass){
    passd = pass
    passd = await checkHasMissingCharacter(passd);
    for (let i = 0; i < passd.length; i++) {
        let d = i+1;

        if(spcChar.includes(passd[i]) && passd[i] == passd[d]){
            passd = passd.replace(passd.charAt(i), randomCat[1].charAt(Math.floor(Math.random()* randomCat[1].length)))
        }
    }

    return passd
}

async function checkHasMissingCharacter(string) {
    hasCapitalLetters = /[A-Z]/.test(string);
    hasSmallLetters = /[a-z]/.test(string);
    hasNumbers = /[0-9]/.test(string);
    hasSpecialCharacters = /[!_*^@$]/g.test(string);

    if(!hasCapitalLetters) {
        string = string.replace(string.charAt(0), randomCat[0].charAt(Math.floor(Math.random()* randomCat[0].length)));
    }

    if(!hasSmallLetters) {
        // console.log('no small letters', string)
        string = string.replace(string.charAt(Math.floor((string.length - 1)/2) - 1), randomCat[1].charAt(Math.floor(Math.random()* randomCat[1].length)));
    }

    if(!hasNumbers) {
        // console.log('no numbers', string)
        string = string.replace(string.charAt(Math.ceil((string.length - 1)/2) + 1), randomCat[2].charAt(Math.floor(Math.random()* randomCat[2].length)));
    }

    if(!hasSpecialCharacters) {
        // console.log('no special characters', string)
        string = string.replace(string.charAt((string.length)-1), randomCat[3].charAt(Math.floor(Math.random()* randomCat[3].length)));
    }

    if(hasCapitalLetters && hasSmallLetters && hasNumbers && hasSpecialCharacters) {
        return string;
    }else{
        await checkHasMissingCharacter(string);
        return string;
    }
}



async function generatePassword(length){
    let pass = '';
 
    for (let i = 1; i <= length; i++) {
        let selector = Math.floor(Math.random()* randomCat.length);
        let choices = randomCat[selector];
        str = choices;


        let char = Math.floor(Math.random()* str.length);
 
        pass += str.charAt(char)
    }

    if(spcChar.includes(pass.charAt(0))) {
        pass = pass.replace(pass.charAt(0), randomCat[1].charAt(Math.floor(Math.random()* randomCat[1].length)))
    }

    pass = await handleRemoveDuplicates(pass);
    return pass;
}

async function handleGeneratePassword(){

    cleartables('generated_passwords')
    var passwordLength = document.getElementById('pass_length').value;
    var passwordCount = document.getElementById('pass_count').value;

    let i = 0;
    let passwordsArray = [];
    let encryptedArray = [];

    while (i < passwordCount) {
        generatedPassword = await generatePassword(passwordLength);
        encryptedPassword = handleEncryption(generatedPassword);

        passwordsArray.push(generatedPassword);
        encryptedArray.push(encryptedPassword);
        i++;
    }

    handlePopulateTable(passwordsArray, encryptedArray, 'generated_passwords');

    stringOutput = document.getElementById("generated_text_output");
    hashOutput = document.getElementById("generated_hash_output");

    stringData = passwordsArray.join("\n");
    hashedData = encryptedArray.join("\n")

    stringOutput.textContent = stringData;
    hashOutput.textContent = hashedData;

}


