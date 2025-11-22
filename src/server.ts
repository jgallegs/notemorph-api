import app from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend NoteMorph escuchando en http://localhost:${PORT}`);
});
