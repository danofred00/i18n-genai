
// Fake translation function
function t(...options) {
    console.log('options', options);
} 

t('Hello, :name!', { name });
t('Goodbye, World!');
t("I love code")