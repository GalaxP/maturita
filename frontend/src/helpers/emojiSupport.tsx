export const supportsFlagEmoji = () => {
    const ctx = document.createElement("canvas").getContext("2d");
    if(!ctx) return false
    ctx.canvas.width = 1; ctx.canvas.height = 1;
    ctx.fillText("🇸🇰", 0, 1);

    return ctx.getImageData(0, 0, 1, 1).data[0] !== 0;
};
