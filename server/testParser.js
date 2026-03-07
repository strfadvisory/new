const XLSX = require("xlsx");
const path = require("path");

function parseReserveStudy(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets["Manual entry"];

  if (!sheet) {
    throw new Error('"Manual entry" sheet not found');
  }

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Parse configuration (first 9 rows)
  const config = {};
  data.slice(0, 9).forEach(row => {
    if (row[0]) config[row[0]] = row[1] || null;
  });

  // Find table header
  const headerIndex = data.findIndex(row => row[0] === "Item Name");
  if (headerIndex === -1) {
    throw new Error("Item table header not found");
  }

  // Parse items
  const items = [];
  for (let i = headerIndex + 2; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;

    items.push({
      itemName: row[0],
      expectedLife: Number(row[1]) || null,
      remainingLife: Number(row[2]) || null,
      replacementCost: Number(row[3]) || 0,
      sirsType: row[4] || null
    });
  }

  return { config, items };
}

// Test with the file
const file = path.join(__dirname, "../untitled folder/GRAND DORAL.xlsx");
const result = parseReserveStudy(file);

console.log(JSON.stringify(result, null, 2));
