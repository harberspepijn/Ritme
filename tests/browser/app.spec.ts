import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function nav(page: Page, label: string) {
  const mobile = await page.locator('.mobile-nav').isVisible();
  await page
    .getByRole('navigation', { name: mobile ? 'Mobiele navigatie' : 'Hoofdnavigatie', exact: true })
    .getByRole('button', { name: label, exact: true })
    .click();
}
async function addHabit(page: Page, name: string, kind = 'binary', weekly = false) {
  await page.getByRole('button', { name: 'Nieuwe gewoonte', exact: true }).click();
  await page.getByLabel('Naam van je gewoonte').fill(name);
  if (kind === 'maximum' || kind === 'avoid')
    await page.getByRole('button', { name: 'Verminderen', exact: true }).click();
  await page.getByLabel('Meetwijze').selectOption(kind);
  if (kind === 'minimum' || kind === 'maximum') await page.getByLabel('Doel per dag').fill('20');
  if (weekly) await page.getByLabel('Wanneer?').selectOption('weekly');
  await page.getByRole('button', { name: 'Gewoonte toevoegen', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
async function editor(page: Page, name: string) {
  await page.getByRole('button', { name: `${name} bekijken en aanpassen`, exact: true }).click();
}
async function saveLog(page: Page) {
  await page.getByRole('button', { name: 'Bewaren', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
async function overflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Kleine stappen. Jouw ritme.' })).toBeVisible();
});

test('lege start, toevoegen, afvinken, ongedaan maken, corrigeren en herladen', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await expect(page.getByRole('heading', { name: 'Hier begint jouw ritme.' })).toBeVisible();
  await addHabit(page, 'Een boek openen');
  await page.getByRole('button', { name: 'Een boek openen: gelukt', exact: true }).click();
  await expect(page.locator('.habit-row.success')).toHaveCount(1);
  await page.getByRole('button', { name: 'Ongedaan maken' }).click();
  await expect(page.locator('.habit-row.pending')).toHaveCount(1);
  await editor(page, 'Een boek openen');
  await page.getByRole('button', { name: 'Niet gelukt', exact: true }).click();
  await saveLog(page);
  await expect(page.locator('.habit-row.failed')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.habit-row.failed')).toContainText('Een boek openen');
  await editor(page, 'Een boek openen');
  await page.getByRole('button', { name: 'Gelukt', exact: true }).click();
  await saveLog(page);
  await expect(page.locator('.habit-row.success')).toHaveCount(1);
  await overflow(page);
  expect(errors).toEqual([]);
});

test('minimum, maximum en vermijden hebben passende invoer en blijven bewaard', async ({
  page,
}) => {
  await addHabit(page, 'Lezen', 'minimum');
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: 'Lezen: 5 toevoegen', exact: true }).click();
    await expect(page.locator('.habit-row').first()).toContainText(`${(i + 1) * 5} / 20`);
  }
  await expect(page.locator('.habit-row.success')).toHaveCount(1);
  await editor(page, 'Lezen');
  await page.getByRole('spinbutton').fill('15');
  await saveLog(page);
  await expect(page.locator('.habit-row.pending')).toHaveCount(1);
  await addHabit(page, 'Telefoon', 'maximum');
  await expect(page.locator('.habit-row').filter({ hasText: 'Telefoon' })).toHaveClass(/pending/);
  await editor(page, 'Telefoon');
  await page.getByRole('spinbutton').fill('15');
  await saveLog(page);
  await expect(page.locator('.habit-row').filter({ hasText: 'Telefoon' })).toHaveClass(/pending/);
  await editor(page, 'Telefoon');
  await page.getByRole('checkbox', { name: /Deze dag is afgerond/ }).check();
  await saveLog(page);
  await expect(page.locator('.habit-row').filter({ hasText: 'Telefoon' })).toHaveClass(/success/);
  await editor(page, 'Telefoon');
  await page.getByRole('spinbutton').fill('25');
  await saveLog(page);
  await expect(page.locator('.habit-row').filter({ hasText: 'Telefoon' })).toHaveClass(/failed/);
  await addHabit(page, 'Niet scrollen', 'avoid');
  await editor(page, 'Niet scrollen');
  await page.getByRole('button', { name: 'Dag vermeden', exact: true }).click();
  await saveLog(page);
  await expect(page.locator('.habit-row').filter({ hasText: 'Niet scrollen' })).toHaveClass(
    /success/,
  );
  await editor(page, 'Niet scrollen');
  await page.getByRole('button', { name: 'Moment registreren' }).click();
  await expect(page.getByRole('button', { name: 'Dag vermeden', exact: true })).toBeDisabled();
  await saveLog(page);
  await expect(page.locator('.habit-row').filter({ hasText: 'Niet scrollen' })).toHaveClass(
    /failed/,
  );
  await expect(
    page.locator('.habit-row').filter({ hasText: 'Niet scrollen' }).locator('.row-goal'),
  ).toContainText('1 moment');
  await page.reload();
  await expect(page.locator('.habit-row.failed')).toHaveCount(2);
  await editor(page, 'Niet scrollen');
  await page.getByRole('button', { name: /Laatste moment corrigeren/ }).click();
  await page.getByRole('button', { name: 'Dag vermeden', exact: true }).click();
  await saveLog(page);
  await expect(page.locator('.habit-row').filter({ hasText: 'Niet scrollen' })).toHaveClass(
    /success/,
  );
  await overflow(page);
});

test('weekdoel, inzicht en archiveren zijn bruikbaar', async ({ page }) => {
  await addHabit(page, 'Buiten wandelen', 'binary', true);
  await expect(page.getByText('Een weekdoel. Jij kiest de dagen.')).toBeVisible();
  await page.getByRole('button', { name: 'Buiten wandelen: gelukt', exact: true }).click();
  await expect(page.locator('.habit-row')).toContainText('1/3 deze week');
  await nav(page, 'Inzicht');
  await expect(page.locator('.insight-metric')).toContainText('1 / 3');
  await page.getByRole('button', { name: 'Maand', exact: true }).click();
  await expect(page.getByText(/weekdoelen bevestigd/)).toBeVisible();
  await nav(page, 'Gewoontes');
  await page.locator('.manage-row').click();
  await page.getByRole('button', { name: 'Pauzeren', exact: true }).click();
  await expect(page.locator('.manage-row')).toContainText('Gepauzeerd');
  await page.reload();
  await nav(page, 'Gewoontes');
  await expect(page.locator('.manage-row')).toContainText('Gepauzeerd');
  await page.locator('.manage-row').click();
  await page.getByRole('button', { name: 'Hervatten', exact: true }).click();
  await page.locator('.manage-row').click();
  await page.getByRole('button', { name: 'Aanpassen', exact: true }).click();
  await page.getByLabel('Naam van je gewoonte').fill('Even naar buiten');
  await page.getByRole('button', { name: 'Wijzigingen bewaren', exact: true }).click();
  await expect(page.locator('.manage-row')).toContainText('Even naar buiten');
  await page.locator('.manage-row').click();
  await page.getByRole('button', { name: 'Archiveren', exact: true }).click();
  await page.getByRole('button', { name: /Archief/ }).click();
  await expect(page.locator('.manage-row')).toContainText('Even naar buiten');
  await page.reload();
  await nav(page, 'Gewoontes');
  await page.getByRole('button', { name: /Archief/ }).click();
  await page.locator('.manage-row').click();
  await expect(page.getByRole('heading', { name: 'Recente registraties' })).toBeVisible();
  await expect(page.locator('.recent-logs>button')).toHaveCount(1);
  await overflow(page);
});

test('export/import rondgang, afwijzing en expliciete bevestiging', async ({ page }) => {
  await addHabit(page, 'Water drinken');
  await page.getByRole('button', { name: 'Water drinken: gelukt', exact: true }).click();
  await expect(page.locator('.habit-row.success')).toHaveCount(1);
  await page.getByRole('button', { name: 'Instellingen', exact: true }).click();
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporteren', exact: true }).click();
  const downloaded = await downloading;
  const exported = await readFile((await downloaded.path())!, 'utf8');
  expect(JSON.parse(exported).logs).toHaveLength(1);
  const file = page.getByLabel('Ritme-bestand importeren');
  await file.setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{}'),
  });
  await expect(page.getByRole('alert')).toContainText('geen geldig Ritme-bestand');
  await expect(page.getByRole('button', { name: 'Vervangen en importeren' })).toHaveCount(0);
  const replacement = JSON.parse(exported);
  replacement.habits[0].name = 'Mijn watermoment';
  await file.setInputFiles({
    name: 'ritme.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(replacement)),
  });
  await expect(page.getByText('Bestand gecontroleerd')).toBeVisible();
  await page.getByRole('button', { name: 'Annuleren', exact: true }).click();
  await page.getByRole('button', { name: 'Sluiten', exact: true }).click();
  await expect(page.locator('.habit-row')).toContainText('Water drinken');
  await page.getByRole('button', { name: 'Instellingen', exact: true }).click();
  await page.getByLabel('Ritme-bestand importeren').setInputFiles({
    name: 'ritme.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(replacement)),
  });
  await page.getByRole('button', { name: 'Vervangen en importeren', exact: true }).click();
  await expect(page.getByText('Je gegevens zijn geïmporteerd.')).toBeVisible();
  await page.getByRole('button', { name: 'Sluiten', exact: true }).click();
  await page.reload();
  await expect(page.locator('.habit-row.success')).toContainText('Mijn watermoment');
});

test('PWA opent en bewaart registraties na offline herladen', async ({ page, context }) => {
  await addHabit(page, 'Offline lezen');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.habit-row')).toContainText('Offline lezen');
  await page.getByRole('button', { name: 'Offline lezen: gelukt', exact: true }).click();
  await expect(page.locator('.habit-row.success')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.habit-row.success')).toContainText('Offline lezen');
  await context.setOffline(false);
});

test('mobiele panelen, toetsenbordfocus, thema en reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Nieuwe gewoonte', exact: true }).click();
  await expect(page.getByLabel('Naam van je gewoonte')).toBeFocused();
  await page
    .getByLabel('Naam van je gewoonte')
    .fill('Een heel lange gewoonte die ook op een smal scherm goed moet passen');
  await page.getByLabel('Meetwijze').selectOption('minimum');
  await page
    .getByRole('button', { name: 'Gewoonte toevoegen', exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole('button', { name: 'Gewoonte toevoegen', exact: true }),
  ).toBeInViewport();
  await page.getByRole('button', { name: 'Gewoonte toevoegen', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Instellingen', exact: true }).click();
  await page.getByRole('button', { name: 'Donker', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Sluiten', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await overflow(page);
  await page.setViewportSize({ width: 320, height: 568 });
  await overflow(page);
  await page.getByRole('button', { name: 'Nieuwe gewoonte', exact: true }).click();
  await page.setViewportSize({ width: 320, height: 330 });
  await page
    .getByRole('button', { name: 'Gewoonte toevoegen', exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole('button', { name: 'Gewoonte toevoegen', exact: true }),
  ).toBeInViewport();
  await overflow(page);
});

test('verwijderen vraagt bevestiging en bewaren werkt in een tweede tab', async ({
  page,
  context,
}) => {
  await addHabit(page, 'Even rust');
  const other = await context.newPage();
  await other.goto('./');
  await expect(other.locator('.habit-row')).toContainText('Even rust');
  await page.getByRole('button', { name: 'Even rust: gelukt', exact: true }).click();
  await expect(other.locator('.habit-row.success')).toHaveCount(1);
  await nav(page, 'Gewoontes');
  await page.locator('.manage-row').click();
  await page.getByRole('button', { name: 'Gewoonte definitief verwijderen', exact: true }).click();
  await page.getByRole('button', { name: 'Annuleren', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Even rust', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Gewoonte definitief verwijderen', exact: true }).click();
  await page.getByRole('button', { name: 'Definitief verwijderen', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.manage-row')).toHaveCount(0);
  await expect(other.locator('.habit-row')).toHaveCount(0);
});

test('een weekdoel telt drie echte dagen; datumwisseling blijft lokaal', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-19T23:59:00+02:00') });
  await page.reload();
  await addHabit(page, 'Drie leesdagen', 'binary', true);
  await page.getByRole('button', { name: 'Drie leesdagen: gelukt', exact: true }).click();
  await expect(page.locator('.habit-row')).toContainText('1/3 deze week');
  await page.clock.fastForward(120000);
  await expect(page.locator('.page-heading .eyebrow')).toContainText('dinsdag');
  await expect(page.locator('.page-heading .eyebrow')).toContainText('20 oktober');
  await page.getByRole('button', { name: 'Drie leesdagen: gelukt', exact: true }).click();
  await expect(page.locator('.habit-row')).toContainText('2/3 deze week');
  await page.clock.fastForward(24 * 60 * 60 * 1000);
  await expect(page.locator('.page-heading .eyebrow')).toContainText('woensdag');
  await page.getByRole('button', { name: 'Drie leesdagen: gelukt', exact: true }).click();
  await expect(page.locator('.habit-row')).toContainText('3/3 deze week');
  await nav(page, 'Inzicht');
  await expect(page.locator('.insight-metric')).toContainText('3 / 3');
});

test('nieuwe doelen veranderen een eerdere dag niet en oude dagen zijn corrigeerbaar', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-19T12:00:00+02:00') });
  await page.reload();
  await addHabit(page, 'Leesmoment', 'minimum');
  await editor(page, 'Leesmoment');
  await page.getByRole('spinbutton').fill('20');
  await saveLog(page);
  await nav(page, 'Gewoontes');
  await page.locator('.manage-row').click();
  await page.getByRole('button', { name: 'Aanpassen', exact: true }).click();
  await page.getByLabel('Doel per dag').fill('40');
  await page.getByRole('button', { name: 'Wijzigingen bewaren', exact: true }).click();
  await page.clock.fastForward(24 * 60 * 60 * 1000);
  await nav(page, 'Vandaag');
  await expect(page.locator('.habit-row')).toContainText('Minimaal 40 minuten');
  await page.getByLabel('Kies een datum').fill('2026-10-19');
  await expect(page.locator('.habit-row.success')).toContainText('Minimaal 20 minuten');
  await editor(page, 'Leesmoment');
  await page.getByRole('spinbutton').fill('15');
  await saveLog(page);
  await expect(page.locator('.habit-row.failed')).toContainText('15 / 20');
  await page.reload();
  await page.getByLabel('Kies een datum').fill('2026-10-19');
  await expect(page.locator('.habit-row.failed')).toContainText('15 / 20');
});

test('alle gegevens wissen vereist de getypte bevestiging', async ({ page }) => {
  await addHabit(page, 'Bewaar dit');
  await page.getByRole('button', { name: 'Instellingen', exact: true }).click();
  await page.getByRole('button', { name: 'Alle gegevens wissen', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Definitief alles wissen', exact: true }),
  ).toBeDisabled();
  await page.getByLabel('Typ WISSEN om te bevestigen').fill('WISSEN');
  await page.getByRole('button', { name: 'Definitief alles wissen', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Hier begint jouw ritme.' })).toBeVisible();
});

test('toegankelijkheid van de hoofdschermen en panelen in licht en donker', async ({ page }) => {
  test.setTimeout(60000);
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  async function scan() {
    await page.evaluate(async () => {
      await Promise.all(document.getAnimations().map((a) => a.finished));
    });
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
  await scan();
  await addHabit(page, 'Lees elke dag', 'minimum');
  await editor(page, 'Lees elke dag');
  await scan();
  await page.getByRole('button', { name: 'Sluiten', exact: true }).click();
  await page.getByRole('button', { name: 'Nieuwe gewoonte', exact: true }).click();
  await scan();
  await page.getByRole('button', { name: 'Sluiten', exact: true }).click();
  await nav(page, 'Inzicht');
  await scan();
  await page.getByRole('button', { name: 'Instellingen', exact: true }).click();
  await page.getByRole('button', { name: 'Donker', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await scan();
  await page.getByRole('button', { name: 'Sluiten', exact: true }).click();
  await scan();
  await nav(page, 'Vandaag');
  await scan();
  await overflow(page);
});

test('compacte dag, snelle minimuminvoer en stabiele rijvolgorde', async ({ page }) => {
  await addHabit(page, 'Lezen', 'minimum');
  await addHabit(page, 'Naar buiten');
  await expect(page.locator('.page-heading h1')).toHaveText('Vandaag');
  await expect(page.locator('.today-aside')).toHaveCount(0);
  const rows = page.locator('.habit-row');
  const first = await rows.first().boundingBox();
  const second = await rows.nth(1).boundingBox();
  expect(first!.y).toBeLessThan(430);
  await page.getByRole('button', { name: 'Lezen: 5 toevoegen', exact: true }).click();
  await expect(rows.first()).toContainText('5 / 20');
  await page.getByRole('button', { name: 'Lezen: 15 toevoegen', exact: true }).click();
  await expect(rows.first()).toHaveClass(/success/);
  await expect(rows.first()).toContainText('20 / 20');
  expect((await rows.nth(1).boundingBox())!.y).toBeCloseTo(second!.y, 0);
  await expect(rows.nth(1)).toContainText('Naar buiten');
  await page.getByRole('button', { name: 'Lezen: 15 toevoegen', exact: true }).click();
  await expect(rows.first()).toContainText('35 / 20');
  await page.getByRole('button', { name: 'Ongedaan maken' }).click();
  await expect(rows.first()).toContainText('20 / 20');
  await editor(page, 'Lezen');
  await expect(page.getByRole('spinbutton')).toBeFocused();
  await page.getByRole('spinbutton').fill('0');
  await saveLog(page);
  await page.reload();
  await expect(rows.first()).toContainText('0 / 20');
  await expect(rows.first()).toHaveClass(/pending/);
  await page.setViewportSize({ width: 320, height: 568 });
  await overflow(page);
});

test('Vandaag en Inzicht delen open, onbekend en toekomst rond middernacht', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-22T23:59:00+02:00') });
  await page.reload();
  await addHabit(page, 'Leeg vandaag');
  await expect(page.locator('.habit-row')).toContainText('Nog open');
  await nav(page, 'Inzicht');
  await expect(
    page.getByRole('button', { name: '22 oktober: Nog open', exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole('button', { name: '23 oktober: Toekomstig', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: '21 oktober: Niet gepland', exact: true }),
  ).toBeDisabled();
  await expect(page.locator('.insight-context')).toContainText('0 dagen onbekend · 1 nog open');
  await page.clock.fastForward(120000);
  await expect(
    page.getByRole('button', { name: '22 oktober: Onbekend', exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole('button', { name: '23 oktober: Nog open', exact: true }),
  ).toBeEnabled();
  await expect(page.locator('.insight-context')).toContainText('1 dag onbekend · 1 nog open');
  await nav(page, 'Vandaag');
  await expect(page.locator('.habit-row')).toContainText('Nog open');
  await page.getByLabel('Kies een datum').fill('2026-10-22');
  await expect(page.locator('.habit-row')).toContainText('Onbekend');
});

test('optionele details blijven bereikbaar met toetsenbord en worden bewaard', async ({ page }) => {
  await page.getByRole('button', { name: 'Nieuwe gewoonte', exact: true }).click();
  await page.getByLabel('Naam van je gewoonte').fill('Naar bed');
  await expect(page.getByLabel('Wanneer?')).toHaveValue('daily');
  await expect(page.getByLabel('Gewenst tijdstip')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Maan', exact: true })).toBeHidden();
  const details = page.locator('.optional-fields summary');
  await details.focus();
  await page.keyboard.press('Enter');
  await page.getByLabel('Gewenst tijdstip').fill('22:30');
  await page.getByRole('button', { name: 'Maan', exact: true }).click();
  await page.getByLabel('Waarom wil je dit?').fill('Meer rust');
  await page.getByLabel('Als het lastig wordt, dan…').fill('Lees ik even.');
  await page.getByRole('button', { name: 'Gewoonte toevoegen', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.habit-row')).toContainText('Richttijd 22:30');
  await editor(page, 'Naar bed');
  await expect(page.getByText('“Meer rust”')).toBeVisible();
  await expect(page.getByText('Lees ik even.', { exact: true })).toBeVisible();
});

test('oude export blijft bruikbaar; grafiek behoudt gaten, nul en historische doelgrenzen', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-22T12:00:00+02:00') });
  await page.reload();
  const goal = {
    effective: '2026-10-01',
    kind: 'maximum',
    target: 120,
    unit: 'minuten',
    time: '',
    schedule: { type: 'daily' },
  };
  const habit = {
    id: 'screen',
    name: 'Schermtijd',
    icon: 'phone',
    reason: '',
    coping: '',
    createdOn: '2026-10-01',
    state: 'active',
    pauses: [],
    versions: [goal],
  };
  const logs = [
    '2026-10-12',
    '2026-10-13',
    '2026-10-14',
    '2026-10-19',
    '2026-10-21',
    '2026-10-22',
  ].map((day, i) => ({
    habitId: habit.id,
    date: day,
    snapshot: goal,
    answer: null,
    closed: true,
    time: '',
    updatedAt: `${day}T10:00:00.000Z`,
    events: [{ id: day, amount: i === 4 ? 0 : i < 3 ? 100 : 80, at: `${day}T10:00:00.000Z` }],
  }));
  const oldExport = { schemaVersion: 1, theme: 'light', habits: [habit], logs };
  await page.getByRole('button', { name: 'Instellingen', exact: true }).click();
  await page.getByLabel('Ritme-bestand importeren').setInputFiles({
    name: 'bestaande-ritme.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(oldExport)),
  });
  await page.getByRole('button', { name: 'Vervangen en importeren', exact: true }).click();
  await expect(page.getByText('Je gegevens zijn geïmporteerd.')).toBeVisible();
  await page.getByRole('button', { name: 'Sluiten', exact: true }).click();
  await page.reload();
  await nav(page, 'Inzicht');
  await expect(page.locator('.chart-point')).toHaveCount(3);
  await expect(page.locator('.chart-line')).toHaveCount(1); // 21→22 only; no line over missing 20.
  await expect(page.locator('.period-comparison')).toContainText('Nog onvoldoende informatie');
  await page.getByText('Waarden en doelen bekijken', { exact: true }).click();
  await expect(page.getByRole('row', { name: '21 oktober 0 ≤ 120', exact: true })).toBeVisible();
  await expect(page.getByRole('row', { name: /20 oktober/ })).toHaveCount(0);
  await page.getByRole('button', { name: '20 oktober: Onbekend', exact: true }).click();
  await page.getByRole('spinbutton').fill('40');
  await saveLog(page);
  await expect(page.locator('.period-comparison')).toContainText('Gemiddeld 60 minuten minder');
  await expect(page.locator('.period-comparison')).toContainText(
    '19 okt–21 okt tegenover 12 okt–14 okt',
  );
  await expect(page.locator('.chart-point')).toHaveCount(4);
  await page.getByRole('button', { name: 'Maand', exact: true }).click();
  await expect(page.locator('.chart-point')).toHaveCount(7);
  await page.setViewportSize({ width: 320, height: 568 });
  await overflow(page);
});
