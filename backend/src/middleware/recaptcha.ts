import { Request, Response, NextFunction } from "express";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

interface RecaptchaAssessment {
  projectID: string;
  recaptchaKey: string;
  token: string;
  recaptchaAction: string;
}

const createAssessment = async ({
  projectID,
  recaptchaKey,
  token,
  recaptchaAction,
}: RecaptchaAssessment) => {
  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectID);

  try {
    const [response] = await client.createAssessment({
      assessment: {
        event: {
          token: token,
          siteKey: recaptchaKey,
        },
      },
      parent: projectPath,
    });

    // Check token validity
    if (!response.tokenProperties?.valid) {
      console.log(
        `Token validation failed: ${response.tokenProperties?.invalidReason}`
      );
      return null;
    }

    // Verify action match
    if (response.tokenProperties?.action !== recaptchaAction) {
      console.log("Action mismatch in reCAPTCHA verification");
      console.log(response.tokenProperties?.action);
      console.log(recaptchaAction);
      return null;
    }

    // Log score and reasons
    console.log(`reCAPTCHA score: ${response.riskAnalysis?.score}`);
    response.riskAnalysis?.reasons?.forEach((reason) => {
      console.log(`Risk reason: ${reason}`);
    });

    return response.riskAnalysis?.score;
  } catch (error) {
    console.error("reCAPTCHA assessment error:", error);
    return null;
  } finally {
    // Clean up client resources
    client.close();
  }
};

export const verifyRecaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { recaptchaToken, recaptchaAction = "default_action" } = req.body;

    if (!recaptchaToken) {
      res.status(400).json({ message: "reCAPTCHA token is required" });
      return;
    }

    const score = await createAssessment({
      projectID: process.env.RECAPTCHA_PROJECT_ID!,
      recaptchaKey: process.env.RECAPTCHA_SITE_KEY!,
      token: recaptchaToken,
      recaptchaAction,
    });

    if (score === null) {
      res.status(400).json({ message: "reCAPTCHA verification failed" });
      return;
    }

    if ((score as number) < 0.5) {
      res.status(400).json({ message: "High risk activity detected" });
      return;
    }

    (req as any).recaptchaScore = score;
    next();
  } catch (error) {
    console.error("reCAPTCHA middleware error:", error);
    res.status(500).json({ message: "reCAPTCHA verification error" });
    return;
  }
};
