# LOTODANCE - Site vitrine

## Contenu livré
- `index.html` : site public (vitrine, agenda, inscription, QR code, partenaires).
- `admin.html` : espace local pour voir/exporter les inscriptions en CSV.
- `assets/site.css` : design responsive.
- `assets/site.js` : logique agenda, formulaire, stockage local, export CSV.
- `assets/logo-lotodance.png` : logo extrait du flyer fourni.

## Modifier les prochaines dates
1. Ouvrir `assets/site.js`.
2. Modifier le tableau `EVENTS` en haut du fichier.
3. Changer `dateISO`, `time`, `location`, `city`, `audience`.
4. Enregistrer : l'agenda et la liste des dates s'actualisent automatiquement.

## Inscriptions en ligne
- Le formulaire enregistre `Prénom`, `Nom`, `Email`, `Événement`.
- Les données sont stockées dans le navigateur (`localStorage`).
- Pour un envoi serveur réel, configurer `REGISTRATION_API_ENDPOINT` dans `assets/site.js`.
- L'espace `admin.html` permet :
  - Export CSV
  - Suppression des inscriptions locales

## QR code
- Généré automatiquement vers `#inscription`.
- En local (fichier), un lien de secours `https://lotodance.fr/#inscription` est affiché.
- En hébergement web, le QR pointe vers l'URL réelle du site.

## Mise en ligne rapide
1. Déposer tous les fichiers du dossier sur votre hébergeur.
2. Ouvrir `index.html`.
3. Vérifier le formulaire, l'agenda et la page `admin.html`.

## Évolution conseillée
Pour passer à une vraie base cloud (multi-utilisateurs), renseigner `REGISTRATION_API_ENDPOINT` avec votre webhook (Supabase, Airtable, Make, Zapier, etc.).
