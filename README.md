# n8n Automation Portfolio — Days 1–4

مجموعة من أربعة workflows مبنية باستخدام **n8n** لأتمتة البريد الإلكتروني، تنظيم المرفقات، وإرسال تقارير يومية. هذه هي المشاريع الأربعة الأولى من سلسلة أتمتة من 30 يومًا.

**GitHub description:** Four n8n workflows for Gmail automation, AI-assisted email handling, Google Drive filing, and Telegram reporting.

## المشاريع

| اليوم | المشروع | ماذا يفعل؟ |
|---|---|---|
| 1 | [ملخص البريد اليومي إلى Telegram — الشرح وطريقة الاستخدام](./01-email-digest-telegram/README.md) | يجمع رسائل Gmail غير المقروءة من آخر 24 ساعة، يلخّصها بالعربية باستخدام Gemini، ثم يرسل ملخصًا يوميًا إلى Telegram. |
| 2 | [الرد الذكي على Gmail — الشرح وطريقة الاستخدام](./02-smart-gmail-replies/README.md) | يصنّف الرسائل الجديدة ويجهّز ردودًا مناسبة. يمكن حفظ الرد كمسودة أو تفعيل الإرسال التلقائي وفق الإعدادات. |
| 3 | [حفظ مرفقات Gmail في Google Drive — الشرح وطريقة الاستخدام](./03-gmail-attachments-to-drive/README.md) | يفلتر المرفقات، يصنّفها ويسمّيها، ثم ينظّمها في Google Drive مع تسجيل النتائج في Google Sheets. |
| 4 | [تقرير المبيعات اليومي — الشرح وطريقة الاستخدام](./04-daily-sales-report/README.md) | يقرأ بيانات المبيعات من Google Sheets ويجهّز تقريرًا يوميًا لإرساله إلى Telegram. |

تحتوي صفحة كل مشروع على شرح workflow وخطوات إعداده وتشغيله، مع الصور. ويحتوي مجلده على ملف `workflow.json` القابل للاستيراد و`caption-ar.txt` الذي يحتفظ بنص المنشور العربي.

## المتطلبات

- نسخة n8n تعمل لديك.
- بيانات اعتماد الخدمات المستخدمة في كل workflow، مثل Gmail وGoogle Sheets وGoogle Drive وTelegram.
- مفتاح Gemini لليوم الأول، ومفتاح OpenAI للأيام التي تستخدم نماذج OpenAI.

## الاستيراد والإعداد

1. نزّل أو استنسخ هذا المستودع.
2. في n8n، استورد ملف `workflow.json` الخاص بالمشروع المطلوب.
3. اربط بيانات اعتماد الخدمات من إعدادات n8n؛ ملفات التصدير لا تتضمن بيانات الاعتماد نفسها.
4. راجع قيم الإعدادات داخل كل workflow، مثل معرّف محادثة Telegram، ومصدر البيانات، والمنطقة الزمنية.
5. شغّل workflow يدويًا واختبره ببيانات مناسبة قبل تفعيله للتشغيل التلقائي.

> **تنبيه:** اختبر مشروع الردود على Gmail في وضع المسودات أولًا، وتأكد من إعدادات الإرسال قبل تفعيل أي رد تلقائي. تعامل مع بيانات البريد والمرفقات ومعلومات العملاء بحذر.

> **قبل النشر العام:** راجع ملفات workflow والصور، واستبدل أي أسماء أو معرّفات أو روابط أو بيانات تخص حساباتك وبيئة العمل. ملفات الاعتماد السرية لا تُصدّر عادةً مع workflow، لكن قد تبقى إعدادات شخصية أو معرّفات موارد ضمن التصدير أو الصور.

## Project structure

```text
01-email-digest-telegram/
  README.md
  workflow.json
  caption-ar.txt
  screenshots/
02-smart-gmail-replies/
  README.md
  workflow.json
  caption-ar.txt
  screenshots/
03-gmail-attachments-to-drive/
  README.md
  workflow.json
  caption-ar.txt
  screenshots/
04-daily-sales-report/
  README.md
  workflow.json
  caption-ar.txt
  screenshots/
```
