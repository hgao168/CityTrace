import { expect, test } from "@playwright/test";

const backendBaseUrl = "http://127.0.0.1:8787";

test.beforeEach(async ({ request }) => {
  const response = await request.post(`${backendBaseUrl}/testing/reset`);
  expect(response.ok()).toBeTruthy();
});

test("loads the journey and syncs backend-connected save and progress actions", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Good morning. Ready to explore?" }),
  ).toBeVisible();
  await expect(page.getByTestId("journey-bootstrap-state")).toHaveText("remote");
  await expect(page.getByRole("button", { name: "Change city" })).toContainText(
    "Amsterdam",
  );
  await expect(page.getByTestId("timeline-item-dam")).toHaveClass(/active/);

  await page.getByTestId("timeline-open-dam").click();

  const detailSheet = page.getByTestId("detail-sheet");
  const saveButton = page.getByTestId("save-place-button");

  await expect(detailSheet).toBeVisible();
  await expect(detailSheet.getByRole("heading", { name: "Dam Square" })).toBeVisible();
  await expect(saveButton).toContainText("Save place");

  const [saveResponse] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/v1/users/web-demo/saved-places/dam") &&
        response.request().method() === "PUT",
    ),
    saveButton.click(),
  ]);
  expect(saveResponse.ok()).toBeTruthy();
  await expect(saveButton).toContainText("Saved");

  const [unsaveResponse] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/v1/users/web-demo/saved-places/dam") &&
        response.request().method() === "DELETE",
    ),
    saveButton.click(),
  ]);
  expect(unsaveResponse.ok()).toBeTruthy();
  await expect(saveButton).toContainText("Save place");

  const progressResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/v1/trips/amsterdam-highlights/progress") &&
      response.request().method() === "PATCH",
  );
  await page.getByTestId("arrive-button").click();
  expect((await progressResponsePromise).ok()).toBeTruthy();

  await expect(page.getByTestId("toast")).toContainText("You arrived at Dam Square");
  await expect(page.getByTestId("timeline-item-dam")).toHaveClass(/done/);
  await expect(page.getByTestId("timeline-item-begijnhof")).toHaveClass(/active/);

  await page.reload();

  await expect(
    page.getByRole("heading", { name: "Good morning. Ready to explore?" }),
  ).toBeVisible();
  await expect(page.getByTestId("timeline-item-dam")).toHaveClass(/done/);
  await expect(page.getByTestId("timeline-item-begijnhof")).toHaveClass(/active/);
});