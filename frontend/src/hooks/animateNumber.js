import formatNumber from "./formatNumber";

export default function animateNumber(targetElement, start, end, duration) {

    const element = document.getElementById(targetElement);
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(start + (end - start) * progress);
        element.innerText = formatNumber(currentValue);
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}