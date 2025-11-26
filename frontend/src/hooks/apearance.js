const root = document.documentElement;

const forceDark = () => {
    root.style.setProperty("--text", "#E5E8EB");
    root.style.setProperty("--text-low", "#ffffff52");
    root.style.setProperty("--bg", "#161819");
    root.style.setProperty("--bgc", "#202324");
    root.style.setProperty("--s2bg", "var(--bg)");
    root.style.setProperty("--grad1", "var(--bg)");
    root.style.setProperty("--grad2", "black");
    root.style.setProperty("--color-s2b", "#1C1C1D");
    root.style.setProperty("--color-s2w", "var(--color-second)");
    root.style.setProperty("--logo", "var(--color-second)");
}

const forceLight = () => {
    root.style.setProperty("--text", "#333");
    root.style.setProperty("--text-low", "#626569");
    root.style.setProperty("--bg", "#F2F4F7");
    root.style.setProperty("--bgc", "#FFFFFF");
    root.style.setProperty("--s2bg", "var(--color-second2)");
    root.style.setProperty("--grad1", "var(--color-second2)");
    root.style.setProperty("--grad2", "#252728");
    root.style.setProperty("--color-s2b", "var(--color-second2)");
    root.style.setProperty("--color-s2w", "var(--color-second2)");
    root.style.setProperty("--logo", "var(--color-second2)");
}

const setMainColor = (color) => {
    root.style.setProperty('--color-main', color);
}

export {forceDark, forceLight, setMainColor}