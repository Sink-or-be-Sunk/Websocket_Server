import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


/**
 * Contact form page.
 * @route GET /contact
 */
export const getContact = (req: Request, res: Response) => {
    res.render("contact", {
        title: "Contact"
    });
};

/**
 * Send a contact form via Nodemailer.
 * @route POST /contact
 */
export const postContact = async (req: Request, res: Response) => {
    await check("name", "Name cannot be blank").not().isEmpty().run(req);
    await check("email", "Email is not valid").isEmail().run(req);
    await check("message", "Message cannot be blank").not().isEmpty().run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/contact");
    }

    const body = `from: ${req.body.name} <${req.body.email}>\ncontent: ${req.body.message}`;

    const mailOptions = {
        to: "mitchaarndt@gmail.com",//TODO: MAKE A NEW EMAIL CALLED SINK OR BE SUNK ROBOT as sender
        from: "SinkOrBeSunk@gmail.com",//this would be the robot account (sender only) 
        subject: "Contact Form",
        text: body
    };

    sgMail.send(mailOptions, undefined, (err)=> {
        if (err) {
            req.flash("errors", { msg: err.message });
            return res.redirect("/contact");
        }
        req.flash("success", { msg: "Email has been sent successfully!" });
        res.redirect("/contact");
    });
};
