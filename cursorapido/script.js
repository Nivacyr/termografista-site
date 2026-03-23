document.addEventListener('DOMContentLoaded', () => {
    // Global Error Handling
    window.onerror = function (msg, url, line, col, error) {
        console.error(`Erro: ${msg}\nLink: ${url}\nLinha: ${line}\nColuna: ${col}\nObjeto: ${error}`);
        // Aqui poderia ser enviado um log para o backend api/log-visitor.php se necessário
        return false;
    };

    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(innerItem => innerItem.classList.remove('active'));

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
                item.querySelector('.faq-answer').setAttribute('aria-hidden', 'false');
            } else {
                question.setAttribute('aria-expanded', 'false');
                item.querySelector('.faq-answer').setAttribute('aria-hidden', 'true');
            }
        });
    });

    // 🛡️ Proteção Anti-Cópia (Hardening conforme Skill)
    // Bloquear botão direito
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Bloquear atalhos de inspeção (F12, Ctrl+Shift+I, Ctrl+U)
    document.addEventListener('keydown', e => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
            (e.ctrlKey && e.key === 'U')
        ) {
            e.preventDefault();
        }
    });

    // Bloquear seleção de texto (opcional, mas recomendado nas skills)
    document.addEventListener('selectstart', e => e.preventDefault());

    // Bloquear drag de imagens
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', e => e.preventDefault());
    });
});
