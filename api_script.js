function makeApiCall(productCode) {
    const apiEndpoint = 'https://world.openfoodfacts.org/api/v2/product/';
    const apiUrl = `${apiEndpoint}${productCode}.json`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    displayBanner('orange', 'Product not found in the database. Sorry for the inconvenience.');
                } else {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
            }
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data);

            // Extract and log the ingredients analysis information
            const ingredientsAnalysis = data.product.ingredients_analysis;
            console.log('Ingredients analysis:', ingredientsAnalysis);
            if (ingredientsAnalysis) {
                // Remove the "en:" prefix from ingredient categories
                const cleanedIngredients = Object.keys(ingredientsAnalysis).reduce((acc, category) => {
                    const cleanedCategory = category.replace(/^en:/, ''); // Remove "en:" prefix
                    acc[cleanedCategory] = ingredientsAnalysis[category].map(ingredient => ingredient.replace(/^en:/, '')); // Remove "en:" prefix from ingredients
                    return acc;
                }, {});

                // Check if it has non-vegan ingredients
                if (cleanedIngredients['non-vegan']) {
                    const nonVeganIngredients = cleanedIngredients['non-vegan'].join(', ');

                    // Check if any non-vegan ingredient includes the word "powder"
                    if (checkForPowderIngredient(cleanedIngredients['non-vegan'])) {
                        displayBanner('green', 'This is vegan.');
                    } else {
                        displayBanner('red', `This is not vegan. Ingredients: ${nonVeganIngredients}`);
                    }
                }
                // Check if it has non-vegetarian ingredients
                else if (cleanedIngredients['non-vegetarian']) {
                    const nonVegetarianIngredients = cleanedIngredients['non-vegetarian'].join(', ');
                    displayBanner('orange', `Note: This is vegetarian. Non-vegetarian ingredients: ${nonVegetarianIngredients}`);
                }
                else {
                    displayBanner('green', 'This is vegan.');
                }
            }

            // You can further process and display the data as needed
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

        function checkForPowderIngredient(ingredients) {
            if(ingredients.some(ingredient => ingredient.toLowerCase().includes('powder'))) {
                return true;
            }

            if(ingredients.some(ingredient => ingredient.toLowerCase().includes('vet'))) {
                return true;
            }
        }

// Other functions remain unchanged

// Display a banner with the given color and message
function displayBanner(color, message) {
    const bannerElement = document.createElement('div');
    bannerElement.style.backgroundColor = color;
    bannerElement.style.padding = '50px'; // Increase padding for a larger banner
    bannerElement.style.color = 'white';
    bannerElement.style.fontSize = '23px'; // Increase font size for better readability on mobile
    bannerElement.style.textAlign = 'center'; // Center-align the text
    bannerElement.innerText = message;

    // Append the banner to the body or a specific element on your page
    document.body.appendChild(bannerElement);

    // Set a timeout to remove the banner after a certain period
    setTimeout(() => {
        document.body.removeChild(bannerElement);
        resetUI(); // Reset the UI after removing the banner
    }, 5000); // Remove the banner after 5 seconds (adjust as needed)
}

// Reset the UI to allow scanning a new product
function resetUI() {
    document.getElementById('show').style.display = 'none';
    document.getElementById('result').textContent = '';
    document.getElementById('reader').innerHTML = ''; // Clear the reader content
    startQRCodeScanning(); // Start QR code scanning
}

// Start QR code scanning
function startQRCodeScanning() {
    const config = { fps: 10, qrbox: { width: 200, height: 200 } };
    html5Qrcode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);
}

// Assuming you have a function to get the decoded text from the result element
function getDecodedText() {
    return document.getElementById('result').textContent;
}

const html5Qrcode = new Html5Qrcode('reader');
const qrCodeSuccessCallback = (decodedText, decodedResult) => {
    if (decodedText) {
        document.getElementById('show').style.display = 'block';
        document.getElementById('result').textContent = decodedText;
        html5Qrcode.stop();

        // Call the API with the decoded text
        const productCode = getDecodedText();
        makeApiCall(productCode);
    }
};

startQRCodeScanning(); // Start QR code scanning initially