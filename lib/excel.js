import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Ensure data directory exists
const ensureDataDir = () => {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    return dataDir;
};

// Read Excel file and return data as array of objects
export const readExcel = (filename) => {
    try {
        const filePath = path.join(process.cwd(), filename);

        if (!fs.existsSync(filePath)) {
            return [];
        }

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        return data;
    } catch (error) {
        console.error('Error reading Excel file:', error);
        return [];
    }
};

// Write data to Excel file
export const writeExcel = (filename, data) => {
    try {
        ensureDataDir();
        const filePath = path.join(process.cwd(), filename);

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

        XLSX.writeFile(workbook, filePath);
        return true;
    } catch (error) {
        console.error('Error writing Excel file:', error);
        return false;
    }
};

// Append a new row to Excel file
export const appendRow = (filename, row) => {
    try {
        const data = readExcel(filename);
        data.push(row);
        return writeExcel(filename, data);
    } catch (error) {
        console.error('Error appending row:', error);
        return false;
    }
};

// Update a row by ID
export const updateRow = (filename, id, newData) => {
    try {
        const data = readExcel(filename);
        const index = data.findIndex(row => row.id === id);

        if (index === -1) {
            return false;
        }

        data[index] = { ...data[index], ...newData };
        return writeExcel(filename, data);
    } catch (error) {
        console.error('Error updating row:', error);
        return false;
    }
};

// Delete a row by ID
export const deleteRow = (filename, id) => {
    try {
        const data = readExcel(filename);
        const filteredData = data.filter(row => row.id !== id);

        if (filteredData.length === data.length) {
            return false; // No row was deleted
        }

        return writeExcel(filename, filteredData);
    } catch (error) {
        console.error('Error deleting row:', error);
        return false;
    }
};

// Find a row by field value
export const findByField = (filename, field, value) => {
    try {
        const data = readExcel(filename);
        return data.find(row => row[field] === value) || null;
    } catch (error) {
        console.error('Error finding row:', error);
        return null;
    }
};

// Filter data by multiple criteria
export const filterData = (filename, criteria) => {
    try {
        const data = readExcel(filename);
        return data.filter(row => {
            return Object.entries(criteria).every(([key, value]) => {
                if (value === undefined || value === null || value === '') {
                    return true;
                }
                return row[key] === value;
            });
        });
    } catch (error) {
        console.error('Error filtering data:', error);
        return [];
    }
};

// Get data within date range
export const getDataByDateRange = (filename, startDate, endDate, dateField = 'tanggal') => {
    try {
        const data = readExcel(filename);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return data.filter(row => {
            const rowDate = new Date(row[dateField]);
            return rowDate >= start && rowDate <= end;
        });
    } catch (error) {
        console.error('Error getting data by date range:', error);
        return [];
    }
};

// Initialize Excel files with headers if they don't exist
export const initializeDataFiles = () => {
    ensureDataDir();

    // Initialize siswa.xlsx
    const siswaPath = path.join(process.cwd(), 'data', 'siswa.xlsx');
    if (!fs.existsSync(siswaPath)) {
        writeExcel('data/siswa.xlsx', []);
    }

    // Initialize presensi.xlsx
    const presensiPath = path.join(process.cwd(), 'data', 'presensi.xlsx');
    if (!fs.existsSync(presensiPath)) {
        writeExcel('data/presensi.xlsx', []);
    }
};
