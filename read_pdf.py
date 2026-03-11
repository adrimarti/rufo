from pypdf import PdfReader

reader = PdfReader(r"c:\Users\work\repos\amp\rufo\PUTEDEX.pdf")
text = ""
for i, page in enumerate(reader.pages):
    text += f"--- Page {i+1} ---\n"
    text += page.extract_text() + "\n"

print(text)
