const TextFormatter = {
  formatQuestionText(text) {
    if (!text) return '';

    const lines = text.split(/\r?\n/);
    const output = [];
    let inTable = false;
    let tableLines = [];
    let currentSeparator = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      let separator = null;
      if (line.includes('|')) separator = '|';
      else if (line.includes(' - ') && !line.trim().startsWith('-')) separator = ' - ';

      if (inTable) {
        if (separator === currentSeparator) {
          tableLines.push(line);
        } else {
          output.push(this.renderTable(tableLines, currentSeparator));
          inTable = false;
          tableLines = [];

          if (separator) {
            inTable = true;
            currentSeparator = separator;
            tableLines.push(line);
          } else {
            output.push(line);
          }
        }
      } else if (separator) {
        inTable = true;
        currentSeparator = separator;
        tableLines.push(line);
      } else {
        output.push(line);
      }
    }

    if (inTable) {
      output.push(this.renderTable(tableLines, currentSeparator));
    }

    return output.join('<br>');
  },

  renderTable(lines, separator = '|') {
    if (!lines || lines.length === 0) return '';

    let html =
      '<div class="table-responsive my-3"><table class="table table-bordered table-sm table-hover align-middle mb-0"><thead>';

    const headers = lines[0].split(separator);
    html += '<tr class="table-light">';
    html += headers
      .map((h) => `<th class="fw-bold text-secondary text-uppercase small" scope="col">${h.trim()}</th>`)
      .join('');
    html += '</tr></thead><tbody>';

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(separator);
      html += `<tr>${cells.map((c) => `<td>${c.trim()}</td>`).join('')}</tr>`;
    }

    html += '</tbody></table></div>';
    return html;
  },
};

export default TextFormatter;
