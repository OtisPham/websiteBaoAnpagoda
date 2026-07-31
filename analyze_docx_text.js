const fs = require('fs');

function extractText(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const tables = content.split('<w:tbl>');
  for (let i = 1; i < tables.length; i++) {
    console.log(`\n--- TABLE ${i} ---`);
    const tableStr = tables[i].split('</w:tbl>')[0];
    const rows = tableStr.split('<w:tr');
    
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r].split('</w:tr>')[0];
      const cells = row.split('<w:tc');
      
      let rowText = [];
      for (let c = 1; c < cells.length; c++) {
        const cell = cells[c].split('</w:tc>')[0];
        // Extract paragraphs in cell
        const paras = cell.split('<w:p');
        let cellText = [];
        for (let p = 1; p < paras.length; p++) {
          const para = paras[p].split('</w:p>')[0];
          const textRuns = para.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
          if (textRuns) {
            const txt = textRuns.map(t => t.replace(/<[^>]+>/g, '')).join('');
            cellText.push(txt);
          }
        }
        rowText.push(cellText.join(' | '));
      }
      console.log(`Row ${r}: ${rowText.join('  ||  ')}`);
    }
  }
}

console.log("\nExtracting 2308-250.docx...");
extractText('c:\\Users\\ADMIN\\Desktop\\pagodaweb\\temp_2308_unzip\\word\\document.xml');
