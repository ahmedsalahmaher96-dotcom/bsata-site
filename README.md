# موقع «ببساطة» — be.bsata

موقع من صفحتين:

- `index.html`: الصفحة الرئيسية (الصورة، النبذة، روابط الحسابات، زر «استكشف المكتبة»)
- `library.html`: صفحة My Library (Prompts · AI Tools · Skills & Files، مع بحث وتصنيفات)

كل المحتوى في ملف واحد: **`data/library.js`**

---

## إضافة مورد جديد

**الطريقة الأسهل:** افتح `bsata-editor/editor.html` (مجلد بجانب هذا المجلد على سطح المكتب) وأضف من النموذج ثم اضغط «حفظ في الموقع». التفاصيل في `bsata-editor/اقرأني.txt`.

أو يدوياً:


1. افتح `data/library.js` بأي محرر نصوص (مثل Notepad أو VS Code).
2. داخل `window.LIBRARY = [ ... ]` أضف عنصراً جديداً. أمثلة:

```js
window.LIBRARY = [
  {
    type: "prompt",
    title: "اسم البرومبت",
    category: "تصميم",
    description: "وصف قصير",
    prompt: `نص البرومبت كاملاً
يمكن أن يكون على عدة أسطر`
  },
  {
    type: "tool",
    title: "اسم الأداة",
    description: "ماذا تفعل",
    url: "https://الموقع-الرسمي"
  },
  {
    type: "skill",
    title: "اسم الـ Skill",
    description: "فائدته",
    url: "https://رابط-الفتح",
    download: "https://رابط-التحميل"
  }
];
```

- `type`: واحد من `"prompt"` أو `"tool"` أو `"skill"`.
- المطلوب فقط `type` و `title`. الباقي اختياري، وأي زر بدون رابط لا يظهر.
- ضع فاصلة `,` بين العناصر.
- نص البرومبت يوضع بين علامتي `` ` `` (backtick) ليقبل عدة أسطر.
- لرفع ملف للتحميل: ضعه داخل مجلد `files/` واكتب `download: "files/اسم-الملف.zip"`.

**تعديل روابط الحسابات** (في نفس الملف، داخل `socials`):
`{ platform: "youtube", label: "YouTube", url: "https://..." }`
المنصات المدعومة: instagram, tiktok, threads, youtube, x, facebook, snapchat, linkedin, website.

**تغيير الصورة:** استبدل `assets/avatar.png` بصورة مربعة بنفس الاسم (يفضّل 400×400 أو أكبر).

**روابط مباشرة لكل تصنيف** (مفيدة في الستوري):
`library.html#prompts` · `library.html#tools` · `library.html#skills`

---

## النشر مجاناً

### الطريقة الأسهل: Netlify Drop (بدون حساب GitHub)
1. ادخل على https://app.netlify.com/drop
2. اسحب مجلد `bsata-site` كاملاً وأفلته في الصفحة.
3. تحصل على رابط فوراً. أنشئ حساباً مجانياً للاحتفاظ به وتغيير اسمه من
   **Site configuration → Change site name** (مثلاً `bsata.netlify.app`).
4. للتحديث لاحقاً: من صفحة الموقع في Netlify → **Deploys** → اسحب المجلد مرة أخرى.

### Vercel
1. ارفع المجلد إلى مستودع على GitHub.
2. ادخل https://vercel.com/new واختر المستودع → **Deploy** (لا يحتاج أي إعدادات).
3. أي تعديل ترفعه على GitHub يُنشر تلقائياً.

بعد النشر ضع الرابط في الـ Bio على Instagram وTikTok.
