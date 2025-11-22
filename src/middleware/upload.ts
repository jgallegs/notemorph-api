import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// 🔹 Solo PDFs (para PDF→DOCX clásico)
const pdfFileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Solo se aceptan PDFs"));
  }
};

// 🔹 Solo imágenes (para OCR de apuntes)
const imageFileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se aceptan imágenes (JPG, PNG, etc.)"));
  }
};

export const uploadPdf = multer({
  storage,
  fileFilter: pdfFileFilter,
});

export const uploadImages = multer({
  storage,
  fileFilter: imageFileFilter,
});
