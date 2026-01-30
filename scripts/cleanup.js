/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');
const uploadsDir = path.join(publicDir, 'images', 'uploads');
const projectsFile = path.join(process.cwd(), 'src/data/projects.json');
const teamFile = path.join(process.cwd(), 'src/data/team.json');

// Collect all used images
let usedImages = new Set();

// 1. Scan Projects
if (fs.existsSync(projectsFile)) {
    const projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
    projects.forEach(p => {
        if (p.images) {
            p.images.forEach(img => usedImages.add(img));
        }
    });
}

// 2. Scan Team
if (fs.existsSync(teamFile)) {
    const team = JSON.parse(fs.readFileSync(teamFile, 'utf8'));
    team.forEach(m => {
        if (m.image) {
            usedImages.add(m.image);
        }
    });
}

console.log(`Found ${usedImages.size} used images.`);

// 3. Scan Uploads Directory
function getAllFiles(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            // Get path relative to 'public'
            const fullPath = path.join(dirPath, file);
            const relativePath = fullPath.replace(publicDir, '').replace(/\\/g, '/');
            arrayOfFiles.push({ fullPath, relativePath });
        }
    });

    return arrayOfFiles;
}

if (fs.existsSync(uploadsDir)) {
    const allUploads = getAllFiles(uploadsDir);
    let deletedCount = 0;

    allUploads.forEach(file => {
        // Check if file.relativePath is in usedImages
        // Normalize usedImages paths just in case
        let isUsed = false;
        usedImages.forEach(used => {
            // Simple string includes check or exact match
            // used: /images/uploads/xxx.jpg
            // file.relativePath: /images/uploads/xxx.jpg
            if (used === file.relativePath) isUsed = true;
        });

        if (!isUsed) {
            console.log(`Deleting unused image: ${file.relativePath}`);
            fs.unlinkSync(file.fullPath);
            deletedCount++;
        }
    });

    console.log(`Cleanup complete. Deleted ${deletedCount} unused images.`);
} else {
    console.log("Uploads directory not found.");
}
