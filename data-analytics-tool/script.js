// Global variables
let rawData = [];
let filteredData = [];
let currentChart = null;
let currentTrendChart = null;

// Feature 1: Data Import
document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                rawData = results.data.filter(row => Object.values(row).some(val => val !== null && val !== ''));
                filteredData = [...rawData];
                displayImportStatus(`Successfully loaded ${rawData.length} rows`);
                updateColumnSelectors();
                displayDataPreview();
            },
            error: function(error) {
                displayImportStatus(`Error: ${error.message}`, 'error');
            }
        });
    }
});

function loadSampleData() {
    // Sample sales data
    rawData = [
        { Product: 'Laptop', Category: 'Electronics', Sales: 1200, Price: 899, Quarter: 'Q1', Rating: 4.5 },
        { Product: 'Phone', Category: 'Electronics', Sales: 2500, Price: 699, Quarter: 'Q1', Rating: 4.7 },
        { Product: 'Tablet', Category: 'Electronics', Sales: 800, Price: 499, Quarter: 'Q1', Rating: 4.3 },
        { Product: 'Headphones', Category: 'Accessories', Sales: 1500, Price: 199, Quarter: 'Q1', Rating: 4.6 },
        { Product: 'Laptop', Category: 'Electronics', Sales: 1350, Price: 899, Quarter: 'Q2', Rating: 4.5 },
        { Product: 'Phone', Category: 'Electronics', Sales: 2800, Price: 699, Quarter: 'Q2', Rating: 4.8 },
        { Product: 'Tablet', Category: 'Electronics', Sales: 950, Price: 499, Quarter: 'Q2', Rating: 4.4 },
        { Product: 'Headphones', Category: 'Accessories', Sales: 1700, Price: 199, Quarter: 'Q2', Rating: 4.7 },
        { Product: 'Laptop', Category: 'Electronics', Sales: 1500, Price: 899, Quarter: 'Q3', Rating: 4.6 },
        { Product: 'Phone', Category: 'Electronics', Sales: 3200, Price: 699, Quarter: 'Q3', Rating: 4.9 },
        { Product: 'Tablet', Category: 'Electronics', Sales: 1100, Price: 499, Quarter: 'Q3', Rating: 4.5 },
        { Product: 'Headphones', Category: 'Accessories', Sales: 1900, Price: 199, Quarter: 'Q3', Rating: 4.8 },
        { Product: 'Monitor', Category: 'Electronics', Sales: 600, Price: 299, Quarter: 'Q1', Rating: 4.4 },
        { Product: 'Keyboard', Category: 'Accessories', Sales: 2200, Price: 79, Quarter: 'Q1', Rating: 4.2 },
        { Product: 'Mouse', Category: 'Accessories', Sales: 2500, Price: 49, Quarter: 'Q1', Rating: 4.3 },
    ];
    filteredData = [...rawData];
    displayImportStatus(`Sample data loaded: ${rawData.length} rows`);
    updateColumnSelectors();
    displayDataPreview();
}

function displayImportStatus(message, type = 'success') {
    const status = document.getElementById('importStatus');
    status.textContent = message;
    status.className = type;
}

// Feature 2: Data Preview
function displayDataPreview() {
    const preview = document.getElementById('dataPreview');
    if (filteredData.length === 0) {
        preview.innerHTML = '<p>No data to display</p>';
        return;
    }

    const columns = Object.keys(filteredData[0]);
    const displayData = filteredData.slice(0, 10);

    let html = '<table><thead><tr>';
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';

    displayData.forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
            html += `<td>${row[col] !== null && row[col] !== undefined ? row[col] : ''}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    html += `<p style="margin-top: 10px; color: #666;">Showing ${displayData.length} of ${filteredData.length} rows</p>`;
    preview.innerHTML = html;
}

// Update all column selectors
function updateColumnSelectors() {
    if (rawData.length === 0) return;

    const columns = Object.keys(rawData[0]);
    const selectors = [
        'summaryColumn', 'filterColumn', 'sortColumn', 
        'xAxis', 'yAxis', 'corrColumn1', 'corrColumn2',
        'trendColumn', 'outlierColumn'
    ];

    selectors.forEach(selectorId => {
        const select = document.getElementById(selectorId);
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select column...</option>';
        columns.forEach(col => {
            select.innerHTML += `<option value="${col}">${col}</option>`;
        });
        if (currentValue) select.value = currentValue;
    });
}

// Feature 3: Statistical Summary
function generateSummary() {
    const column = document.getElementById('summaryColumn').value;
    if (!column) {
        alert('Please select a column');
        return;
    }

    const values = filteredData.map(row => row[column]).filter(val => val !== null && val !== undefined);
    const numericValues = values.filter(val => typeof val === 'number');

    let html = '<div class="stat-grid">';

    if (numericValues.length > 0) {
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const mean = sum / numericValues.length;
        const sorted = [...numericValues].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0 
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 
            : sorted[Math.floor(sorted.length / 2)];
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
        const stdDev = Math.sqrt(variance);

        html += `
            <div class="stat-item"><div class="stat-label">Count</div><div class="stat-value">${numericValues.length}</div></div>
            <div class="stat-item"><div class="stat-label">Mean</div><div class="stat-value">${mean.toFixed(2)}</div></div>
            <div class="stat-item"><div class="stat-label">Median</div><div class="stat-value">${median.toFixed(2)}</div></div>
            <div class="stat-item"><div class="stat-label">Min</div><div class="stat-value">${min.toFixed(2)}</div></div>
            <div class="stat-item"><div class="stat-label">Max</div><div class="stat-value">${max.toFixed(2)}</div></div>
            <div class="stat-item"><div class="stat-label">Std Dev</div><div class="stat-value">${stdDev.toFixed(2)}</div></div>
        `;
    } else {
        // Categorical data
        const frequency = {};
        values.forEach(val => {
            frequency[val] = (frequency[val] || 0) + 1;
        });
        const uniqueCount = Object.keys(frequency).length;
        const mode = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);

        html += `
            <div class="stat-item"><div class="stat-label">Count</div><div class="stat-value">${values.length}</div></div>
            <div class="stat-item"><div class="stat-label">Unique</div><div class="stat-value">${uniqueCount}</div></div>
            <div class="stat-item"><div class="stat-label">Mode</div><div class="stat-value">${mode}</div></div>
        `;
    }

    html += '</div>';
    document.getElementById('summaryOutput').innerHTML = html;
}

// Feature 4: Data Visualization
function createChart() {
    const chartType = document.getElementById('chartType').value;
    const xAxis = document.getElementById('xAxis').value;
    const yAxis = document.getElementById('yAxis').value;

    if (!xAxis || !yAxis) {
        alert('Please select both X and Y axes');
        return;
    }

    const ctx = document.getElementById('mainChart').getContext('2d');

    if (currentChart) {
        currentChart.destroy();
    }

    // Aggregate data
    const aggregated = {};
    filteredData.forEach(row => {
        const key = row[xAxis];
        if (!aggregated[key]) {
            aggregated[key] = [];
        }
        aggregated[key].push(row[yAxis]);
    });

    const labels = Object.keys(aggregated);
    const data = labels.map(key => {
        const values = aggregated[key].filter(v => typeof v === 'number');
        return values.reduce((a, b) => a + b, 0) / values.length;
    });

    const config = {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: `${yAxis} by ${xAxis}`,
                data: data,
                backgroundColor: [
                    'rgba(102, 126, 234, 0.7)',
                    'rgba(118, 75, 162, 0.7)',
                    'rgba(237, 100, 166, 0.7)',
                    'rgba(255, 154, 158, 0.7)',
                    'rgba(250, 208, 196, 0.7)',
                    'rgba(155, 207, 232, 0.7)'
                ],
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: chartType !== 'pie' ? {
                y: {
                    beginAtZero: true
                }
            } : {}
        }
    };

    currentChart = new Chart(ctx, config);
}

// Feature 5: Data Filtering
function applyFilter() {
    const column = document.getElementById('filterColumn').value;
    const operator = document.getElementById('filterOperator').value;
    const value = document.getElementById('filterValue').value;

    if (!column || !value) {
        alert('Please select a column and enter a value');
        return;
    }

    filteredData = rawData.filter(row => {
        const cellValue = row[column];
        
        switch(operator) {
            case 'equals':
                return String(cellValue).toLowerCase() === value.toLowerCase();
            case 'contains':
                return String(cellValue).toLowerCase().includes(value.toLowerCase());
            case 'greater':
                return Number(cellValue) > Number(value);
            case 'less':
                return Number(cellValue) < Number(value);
            default:
                return true;
        }
    });

    document.getElementById('filterStatus').innerHTML = 
        `<span class="success">Filter applied: ${filteredData.length} rows match the criteria</span>`;
    displayDataPreview();
}

function clearFilter() {
    filteredData = [...rawData];
    document.getElementById('filterValue').value = '';
    document.getElementById('filterStatus').innerHTML = 
        `<span class="info">Filter cleared: Showing all ${rawData.length} rows</span>`;
    displayDataPreview();
}

// Feature 6: Data Sorting
function sortData() {
    const column = document.getElementById('sortColumn').value;
    const order = document.getElementById('sortOrder').value;

    if (!column) {
        alert('Please select a column to sort');
        return;
    }

    filteredData.sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return order === 'asc' ? aVal - bVal : bVal - aVal;
        } else {
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            if (order === 'asc') {
                return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
            } else {
                return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
            }
        }
    });

    displayDataPreview();
}

// Feature 7: Correlation Analysis
function calculateCorrelation() {
    const col1 = document.getElementById('corrColumn1').value;
    const col2 = document.getElementById('corrColumn2').value;

    if (!col1 || !col2) {
        alert('Please select both columns');
        return;
    }

    const pairs = filteredData
        .map(row => [row[col1], row[col2]])
        .filter(pair => typeof pair[0] === 'number' && typeof pair[1] === 'number');

    if (pairs.length < 2) {
        document.getElementById('correlationOutput').innerHTML = 
            '<span class="error">Not enough numeric data for correlation analysis</span>';
        return;
    }

    const n = pairs.length;
    const sum1 = pairs.reduce((acc, pair) => acc + pair[0], 0);
    const sum2 = pairs.reduce((acc, pair) => acc + pair[1], 0);
    const sum1Sq = pairs.reduce((acc, pair) => acc + pair[0] * pair[0], 0);
    const sum2Sq = pairs.reduce((acc, pair) => acc + pair[1] * pair[1], 0);
    const pSum = pairs.reduce((acc, pair) => acc + pair[0] * pair[1], 0);

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

    const correlation = den === 0 ? 0 : num / den;

    let interpretation = '';
    const absCorr = Math.abs(correlation);
    if (absCorr > 0.7) interpretation = 'Strong';
    else if (absCorr > 0.4) interpretation = 'Moderate';
    else interpretation = 'Weak';

    const direction = correlation > 0 ? 'positive' : 'negative';

    document.getElementById('correlationOutput').innerHTML = `
        <div class="stat-grid">
            <div class="stat-item">
                <div class="stat-label">Correlation Coefficient</div>
                <div class="stat-value">${correlation.toFixed(4)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Interpretation</div>
                <div class="stat-value" style="font-size: 18px;">${interpretation} ${direction}</div>
            </div>
        </div>
        <p style="margin-top: 15px; color: #666;">
            ${col1} and ${col2} show a ${interpretation.toLowerCase()} ${direction} correlation.
        </p>
    `;
}

// Feature 8: Trend Analysis
function analyzeTrend() {
    const column = document.getElementById('trendColumn').value;

    if (!column) {
        alert('Please select a column');
        return;
    }

    const values = filteredData
        .map(row => row[column])
        .filter(val => typeof val === 'number');

    if (values.length < 2) {
        document.getElementById('trendOutput').innerHTML = 
            '<span class="error">Not enough numeric data for trend analysis</span>';
        return;
    }

    // Calculate linear regression
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * values[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const trendDirection = slope > 0 ? 'Upward' : slope < 0 ? 'Downward' : 'Flat';
    const trendStrength = Math.abs(slope);

    document.getElementById('trendOutput').innerHTML = `
        <div class="stat-grid">
            <div class="stat-item">
                <div class="stat-label">Trend Direction</div>
                <div class="stat-value" style="font-size: 18px;">${trendDirection}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Slope</div>
                <div class="stat-value">${slope.toFixed(4)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Intercept</div>
                <div class="stat-value">${intercept.toFixed(2)}</div>
            </div>
        </div>
    `;

    // Create trend chart
    const ctx = document.getElementById('trendChart').getContext('2d');
    if (currentTrendChart) {
        currentTrendChart.destroy();
    }

    const trendLine = x.map(xi => slope * xi + intercept);

    currentTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: x,
            datasets: [{
                label: 'Actual Values',
                data: values,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.1
            }, {
                label: 'Trend Line',
                data: trendLine,
                borderColor: 'rgba(237, 100, 166, 1)',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

// Feature 9: Data Export
function exportToCSV() {
    const csv = Papa.unparse(filteredData);
    downloadFile(csv, 'data-export.csv', 'text/csv');
}

function exportToJSON() {
    const json = JSON.stringify(filteredData, null, 2);
    downloadFile(json, 'data-export.json', 'application/json');
}

function exportReport() {
    let report = 'DATA ANALYTICS REPORT\n';
    report += '='.repeat(50) + '\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Total Records: ${filteredData.length}\n\n`;

    if (filteredData.length > 0) {
        const columns = Object.keys(filteredData[0]);
        report += 'COLUMNS:\n';
        columns.forEach(col => {
            report += `- ${col}\n`;
        });
    }

    downloadFile(report, 'analytics-report.txt', 'text/plain');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Feature 10: Outlier Detection
function detectOutliers() {
    const column = document.getElementById('outlierColumn').value;

    if (!column) {
        alert('Please select a column');
        return;
    }

    const values = filteredData
        .map((row, index) => ({ value: row[column], index: index, row: row }))
        .filter(item => typeof item.value === 'number');

    if (values.length < 4) {
        document.getElementById('outlierOutput').innerHTML = 
            '<span class="error">Not enough numeric data for outlier detection</span>';
        return;
    }

    // Calculate IQR method
    const sorted = values.map(v => v.value).sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers = values.filter(item => item.value < lowerBound || item.value > upperBound);

    let html = `
        <div class="stat-grid">
            <div class="stat-item">
                <div class="stat-label">Outliers Found</div>
                <div class="stat-value">${outliers.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Lower Bound</div>
                <div class="stat-value">${lowerBound.toFixed(2)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Upper Bound</div>
                <div class="stat-value">${upperBound.toFixed(2)}</div>
            </div>
        </div>
    `;

    if (outliers.length > 0) {
        html += '<div class="outlier-list">';
        outliers.forEach(outlier => {
            html += `<div class="outlier-item">Row ${outlier.index + 1}: ${column} = ${outlier.value}</div>`;
        });
        html += '</div>';
    } else {
        html += '<p style="margin-top: 15px; color: #28a745;">No outliers detected using IQR method</p>';
    }

    document.getElementById('outlierOutput').innerHTML = html;
}

// Initialize
window.addEventListener('load', function() {
    console.log('Data Analytics Tool loaded successfully');
});
