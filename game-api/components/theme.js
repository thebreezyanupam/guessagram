export function initializeTheme() {
    const savedTheme = localStorage.getItem("theme") || "blue";
    if (savedTheme === "orange") {
        applyOrangeTheme();
    } else {
        applyBlueTheme();
    }
}

export function toggleTheme() {
    if (document.body.classList.contains("bg-gray-900")) {
        applyOrangeTheme();
        localStorage.setItem("theme", "orange"); // Save orange theme
    } else {
        applyBlueTheme();
        localStorage.setItem("theme", "blue"); // Save blue theme
    }
}

function applyBlueTheme() {
    document.body.classList.add("bg-gray-900");
    document.body.classList.remove("dark-theme");

    document.querySelectorAll('.neon-text').forEach(element => {
        element.classList.add('text-neon-blue');
        element.classList.remove('text-neon-orange');
    });

    // Update button classes for blue theme
    document.querySelectorAll('.button-neon-orange').forEach(button => {
        button.classList.replace('button-neon-orange', 'button-neon-blue');
    });

    // Apply theme to existing popups and set up for future popups
    updatePopupsTheme("blue");

    document.getElementById("theme-button").textContent = "Switch Theme";
}

function applyOrangeTheme() {
    document.body.classList.add("dark-theme");
    document.body.classList.remove("bg-gray-900");

    document.querySelectorAll('.neon-text').forEach(element => {
        element.classList.add('text-neon-orange');
        element.classList.remove('text-neon-blue');
    });

    // Update button classes for orange theme
    document.querySelectorAll('.button-neon-blue').forEach(button => {
        button.classList.replace('button-neon-blue', 'button-neon-orange');
    });

    // Apply theme to existing popups and set up for future popups
    updatePopupsTheme("orange");

    document.getElementById("theme-button").textContent = "Switch Theme";
}

function updatePopupsTheme(theme) {
    // Find all popups and apply the theme
    document.querySelectorAll('.popup-content').forEach(popup => {
        if (theme === "blue") {
            popup.classList.remove('dark-theme');
            popup.style.borderColor = "#00e5ff";
            popup.style.color = "#00e5ff";
        } else if (theme === "orange") {
            popup.classList.add('dark-theme');
            popup.style.borderColor = "#ffa500";
            popup.style.color = "#ffa500";
        }
    });
}
