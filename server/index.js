const express = require("express");
const fs = require("fs");
const { parse } = require("csv-parse");
const cors = require("cors");
const path = require("path")

const app = express();
const port = 3004;

// Использовал CORS middleware
app.use(cors());

let records = [];

const loadCSV = () => {
  const csvFilePath = path.join(__dirname, "./article_def_v_orig.csv");
  fs.readFile(csvFilePath, (err, data) => {
    if (err) {
      console.error("Error reading CSV file:", err);
      return;
    }

    parse(
      data,
      {
        columns: true,
        skip_empty_lines: true,
      },
      (err, parsedData) => {
        if (err) {
          console.error("Error parsing CSV file:", err);
          return;
        }
        records = parsedData;
      }
    );
  });
};

loadCSV();

app.get("/total", (req, res) => {
  res.json({ total: records.length });
});

app.get("/records", (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedRecords = records.slice(start, end);

  res.json({
    page,
    pageSize,
    total: records.length,
    records: paginatedRecords,
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

console.log("records", records);
