const fs = require('fs');

function analyzeFile(filePath) {
  console.log(`\nAnalyzing ${filePath}...`);
  if (!fs.existsSync(filePath)) {
    console.log('File not found!');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract page dimensions
  const pgSzMatch = content.match(/<w:pgSz\s+w:w="(\d+)"\s+w:h="(\d+)"/);
  if (pgSzMatch) {
    console.log(`Page Size: W=${pgSzMatch[1]} twips, H=${pgSzMatch[2]} twips`);
  }
  
  // Extract margins
  const pgMarMatch = content.match(/<w:pgMar\s+w:top="(\d+)"\s+w:right="(\d+)"\s+w:bottom="(\d+)"\s+w:left="(\d+)"/);
  if (pgMarMatch) {
    console.log(`Margins: Top=${pgMarMatch[1]}, Right=${pgMarMatch[2]}, Bottom=${pgMarMatch[3]}, Left=${pgMarMatch[4]}`);
  }
  
  // Find tables and their column widths
  const tables = content.split('<w:tbl>');
  console.log(`Found ${tables.length - 1} tables.`);
  
  for (let i = 1; i < tables.length; i++) {
    const table = tables[i].split('</w:tbl>')[0];
    
    // Find tblGrid
    const gridMatch = table.match(/<w:tblGrid>(.*?)<\/w:tblGrid>/);
    if (gridMatch) {
      const gridCols = gridMatch[1].match(/<w:gridCol\s+w:w="(\d+)"/g);
      if (gridCols) {
        const widths = gridCols.map(g => {
          const wMatch = g.match(/w:w="(\d+)"/);
          return wMatch ? parseInt(wMatch[1]) : 0;
        });
        console.log(`  Table ${i} Grid Columns: ${widths.length} columns, Widths: ${widths.join(', ')} twips`);
      }
    }
    
    // Check row heights
    const rows = table.split('<w:tr');
    let rowHeights = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r].split('</w:tr>')[0];
      const hMatch = row.match(/<w:trHeight\s+w:val="(\d+)"/);
      if (hMatch) {
        rowHeights.push(parseInt(hMatch[1]));
      }
    }
    if (rowHeights.length > 0) {
      console.log(`  Table ${i} Row Heights (first 5): ${rowHeights.slice(0,5).join(', ')} twips`);
    }
  }
}

analyzeFile('c:\\Users\\ADMIN\\Desktop\\pagodaweb\\temp_1607_unzip\\word\\document.xml');
analyzeFile('c:\\Users\\ADMIN\\Desktop\\pagodaweb\\temp_2308_unzip\\word\\document.xml');
