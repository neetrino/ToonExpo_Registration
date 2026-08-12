
**UTM հղումներ — կարճ հրահանգ (TOON EXPO գրանցում)**

Գրանցման էջի հասցեն՝ `https://reg.toonexpo.com`

Յուրաքանչյուր հարթակի / գովազդի համար օգտագործեք **առանձին հղում** UTM պարամետրերով։ Համակարգը ավտոմատ կֆիքսի, թե որ աղբյուրից է մարդը գրանցվել։

**Պարտադիր ձևաչափ**
```text
https://reg.toonexpo.com?utm_source=...&utm_medium=...&utm_campaign=...
```

**Ինչ նշել**
- `utm_source` — հարթակ (օր. `facebook`, `instagram`, `tiktok`, `youtube`)
- `utm_medium` — ձևաչափ / տեսակ (օր. `video`, `stories`, `cpc`, `reels`)
- `utm_campaign` — արշավի անուն (օր. `tey26`, `launch`, `post_new1`)

**Օրինակներ**
```text
https://reg.toonexpo.com?utm_source=facebook&utm_medium=video&utm_campaign=tey26
https://reg.toonexpo.com?utm_source=instagram&utm_medium=stories&utm_campaign=tey26
https://reg.toonexpo.com?utm_source=tiktok&utm_medium=video&utm_campaign=tey26
```

**Կանոններ**
1. Գովազդում / պոստում տեղադրեք հենց այս ամբողջ հղումը։
2. Արժեքները գրեք **լատինատառ**, առանց բացատների։ Թույլատրելի են տառեր, թվեր և `_` `.` `-`։
3. Մի օգտագործեք այլ պարամետրեր (`utm_post`, `utm_content` և այլն) — համակարգը **չի պահում** դրանք։ Եթե պետք է տարբերակել պոստը, գրեք դա `utm_campaign`-ի մեջ (օր. `post_new1`)։
4. Տարբեր հարթակների համար պարտադիր փոխեք գոնե `utm_source`-ը, որ հետո հասկանանք՝ որտեղից քանի մարդ է գրանցվել։
5. Եթե մարդը մտնի առանց UTM-ի (`https://reg.toonexpo.com`), աղբյուրը կմնա դատարկ։