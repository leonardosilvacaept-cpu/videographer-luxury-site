const ALLOWED_PROJECT_TYPES = new Set([
    "Filme de marca",
    "Campanha",
    "Evento",
    "Videoclipe",
    "Ainda não sei"
]);

const ALLOWED_BUDGETS = new Set([
    "",
    "Até 750 €",
    "750 € a 1.500 €",
    "1.500 € a 3.000 €",
    "3.000 € a 6.000 €",
    "Mais de 6.000 €"
]);

function jsonResponse(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                "Content-Type":
                    "application/json; charset=utf-8",
                "Cache-Control":
                    "no-store"
            }
        }
    );
}

function cleanText(value, maximumLength) {
    return String(value || "")
        .trim()
        .replace(/\u0000/g, "")
        .slice(0, maximumLength);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value
    );
}

function validatePayload(payload) {
    const name = cleanText(
        payload.name,
        100
    );

    const email = cleanText(
        payload.email,
        180
    ).toLowerCase();

    const projectType = cleanText(
        payload.projectType,
        80
    );

    const message = cleanText(
        payload.message,
        1500
    );

    const date = cleanText(
        payload.date,
        100
    );

    const budget = cleanText(
        payload.budget,
        80
    );

    /*
    Campo invisível usado para apanhar bots.
    Uma pessoa real nunca o deverá preencher.
    */

    const website = cleanText(
        payload.website,
        200
    );

    if (website) {
        return {
            valid: false,
            status: 400,
            error: "Pedido inválido."
        };
    }

    if (name.length < 2) {
        return {
            valid: false,
            status: 400,
            error:
                "Indica um nome válido."
        };
    }

    if (!isValidEmail(email)) {
        return {
            valid: false,
            status: 400,
            error:
                "Indica um e-mail válido."
        };
    }

    if (
        !ALLOWED_PROJECT_TYPES.has(
            projectType
        )
    ) {
        return {
            valid: false,
            status: 400,
            error:
                "Escolhe um tipo de projeto válido."
        };
    }

    if (message.length < 10) {
        return {
            valid: false,
            status: 400,
            error:
                "A descrição da ideia é demasiado curta."
        };
    }

    if (
        !ALLOWED_BUDGETS.has(budget)
    ) {
        return {
            valid: false,
            status: 400,
            error:
                "Escolhe um orçamento válido."
        };
    }

    return {
        valid: true,
        data: {
            name,
            email,
            projectType,
            message,
            date,
            budget
        }
    };
}

function createEmailHtml(data) {
    const name = escapeHtml(data.name);
    const email = escapeHtml(data.email);
    const projectType =
        escapeHtml(data.projectType);

    const message = escapeHtml(
        data.message
    ).replace(/\n/g, "<br>");

    const date = escapeHtml(
        data.date ||
        "Ainda não definida"
    );

    const budget = escapeHtml(
        data.budget ||
        "Ainda não definido"
    );

    return `
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
        </head>

        <body
            style="
                margin: 0;
                padding: 0;
                background: #070707;
                color: #f2eee6;
                font-family: Arial, Helvetica, sans-serif;
            "
        >
            <div
                style="
                    max-width: 720px;
                    margin: 0 auto;
                    padding: 50px 28px;
                "
            >
                <div
                    style="
                        margin-bottom: 42px;
                        color: #b79863;
                        font-size: 13px;
                        letter-spacing: 3px;
                    "
                >
                    NORTHFRAME.
                </div>

                <p
                    style="
                        margin: 0 0 10px;
                        color: #b79863;
                        font-size: 12px;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                    "
                >
                    Novo pedido de projeto
                </p>

                <h1
                    style="
                        margin: 0 0 40px;
                        color: #f2eee6;
                        font-family: Georgia, serif;
                        font-size: 45px;
                        font-weight: normal;
                        line-height: 1;
                    "
                >
                    ${projectType}
                </h1>

                <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    style="
                        margin-bottom: 38px;
                        border-collapse: collapse;
                    "
                >
                    <tr>
                        <td
                            style="
                                width: 35%;
                                padding: 13px 0;
                                border-bottom: 1px solid #252525;
                                color: #8e8a82;
                                font-size: 12px;
                                text-transform: uppercase;
                            "
                        >
                            Nome
                        </td>

                        <td
                            style="
                                padding: 13px 0;
                                border-bottom: 1px solid #252525;
                                color: #f2eee6;
                            "
                        >
                            ${name}
                        </td>
                    </tr>

                    <tr>
                        <td
                            style="
                                padding: 13px 0;
                                border-bottom: 1px solid #252525;
                                color: #8e8a82;
                                font-size: 12px;
                                text-transform: uppercase;
                            "
                        >
                            E-mail
                        </td>

                        <td
                            style="
                                padding: 13px 0;
                                border-bottom: 1px solid #252525;
                            "
                        >
                            <a
                                href="mailto:${email}"
                                style="color: #b79863;"
                            >
                                ${email}
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <td
                            style="
                                padding: 13px 0;
                                border-bottom: 1px solid #252525;
                                color: #8e8a82;
                                font-size: 12px;
                                text-transform: uppercase;
                            "
                        >
                            Data
                        </td>

                        <td
                            style="
                                padding: 13px 0;
                                border-bottom: 1px solid #252525;
                            "
                        >
                            ${date}
                        </td>
                    </tr>

                    <tr>
                        <td
                            style="
                                padding: 13px 0;
                                border-bottom: 1px solid #252525;
                                color: #8e8a82;
                                font-size: 12px;
                                text-transform: uppercase;
                            "
                        >
                            Orçamento
                        </td>

                        <td
                            style="
                                padding: 13px 0;
                                border-bottom: 1px solid #252525;
                            "
                        >
                            ${budget}
                        </td>
                    </tr>
                </table>

                <div
                    style="
                        padding: 28px;
                        border: 1px solid #292929;
                        background: #101010;
                    "
                >
                    <p
                        style="
                            margin: 0 0 15px;
                            color: #b79863;
                            font-size: 12px;
                            letter-spacing: 2px;
                            text-transform: uppercase;
                        "
                    >
                        A ideia
                    </p>

                    <p
                        style="
                            margin: 0;
                            color: #ded8ce;
                            font-size: 16px;
                            line-height: 1.8;
                        "
                    >
                        ${message}
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const contentType =
            request.headers.get(
                "content-type"
            ) || "";

        if (
            !contentType.includes(
                "application/json"
            )
        ) {
            return jsonResponse(
                {
                    ok: false,
                    error:
                        "Formato do pedido inválido."
                },
                415
            );
        }

        const payload =
            await request.json();

        const validation =
            validatePayload(payload);

        if (!validation.valid) {
            return jsonResponse(
                {
                    ok: false,
                    error:
                        validation.error
                },
                validation.status
            );
        }

        if (!env.RESEND_API_KEY) {
            console.error(
                "RESEND_API_KEY não está configurada."
            );

            return jsonResponse(
                {
                    ok: false,
                    error:
                        "O serviço de envio ainda não está configurado."
                },
                500
            );
        }

        if (
            !env.CONTACT_TO_EMAIL ||
            !env.CONTACT_FROM_EMAIL
        ) {
            console.error(
                "Os endereços de contacto não estão configurados."
            );

            return jsonResponse(
                {
                    ok: false,
                    error:
                        "Os endereços de envio ainda não estão configurados."
                },
                500
            );
        }

        const data =
            validation.data;

        const resendResponse =
            await fetch(
                "https://api.resend.com/emails",
                {
                    method: "POST",
                    headers: {
                        "Authorization":
                            `Bearer ${env.RESEND_API_KEY}`,
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        from:
                            env.CONTACT_FROM_EMAIL,

                        to: [
                            env.CONTACT_TO_EMAIL
                        ],

                        reply_to:
                            data.email,

                        subject:
                            `Novo projeto: ${data.projectType} — ${data.name}`,

                        html:
                            createEmailHtml(data)
                    })
                }
            );

        const resendResult =
            await resendResponse.json();

        if (!resendResponse.ok) {
            console.error(
                "Erro do Resend:",
                resendResult
            );

            return jsonResponse(
                {
                    ok: false,
                    error:
                        "Não foi possível enviar o pedido. Tenta novamente."
                },
                502
            );
        }

        return jsonResponse(
            {
                ok: true,
                message:
                    "O pedido foi enviado com sucesso."
            }
        );
    } catch (error) {
        console.error(
            "Erro ao processar o formulário:",
            error
        );

        return jsonResponse(
            {
                ok: false,
                error:
                    "Ocorreu um erro inesperado. Tenta novamente."
            },
            500
        );
    }
}

export function onRequestGet() {
    return jsonResponse(
        {
            ok: false,
            error:
                "Método não permitido."
        },
        405
    );
}