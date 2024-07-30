import { Resend } from "resend";

const resend = new Resend("re_LakRf2Zz_9PHY2eDX5MFegQAHCtA2aqZy");

const sendEmail = async (email, verificationToken) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Email Verification link",
      html: `
<div style = "background-color: white; padding: 20px; border-radius: 10px; text-align: center" >
<h1 style="font-size: 30px; font-weight: 700 " > Welcome to Readme </h1>
<p style="font-size: 20px; font-weight: 500 " > Please verify your email address </p>   
<a href="http://localhost:8080/api/v1/users/verify-email/${verificationToken}" style="background-color: blue; color: white; padding: 10px; border-radius: 10px;" > Verify Email </a>
</div>
`,
    });
  } catch (error) {
    console.log(error);
  }
};

export default sendEmail;
