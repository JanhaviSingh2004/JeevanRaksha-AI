from deep_translator import GoogleTranslator

text = "Patient has mild fever and cough for 3 days."

summary_hindi = GoogleTranslator(source="auto", target="hi").translate(text)
summary_punjabi = GoogleTranslator(source="auto", target="pa").translate(text)

print("Hindi:", summary_hindi)
print("Punjabi:", summary_punjabi)
