document.addEventListener("DOMContentLoaded", () => {
    const copyButtons = document.querySelectorAll("[data-copy-link]");

    const copyText = (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }

        return new Promise((resolve, reject) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();

            try {
                document.execCommand("copy") ? resolve() : reject();
            } catch (error) {
                reject(error);
            } finally {
                textArea.remove();
            }
        });
    };

    copyButtons.forEach((button) => {
        const label = button.querySelector("span");
        const defaultLabel = label.textContent;

        button.addEventListener("click", () => {
            copyText(window.location.href)
                .then(() => {
                    label.textContent = "Copied!";
                    window.setTimeout(() => {
                        label.textContent = defaultLabel;
                    }, 2000);
                })
                .catch(() => {
                    label.textContent = "Copy failed";
                    window.setTimeout(() => {
                        label.textContent = defaultLabel;
                    }, 2000);
                });
        });
    });
});
