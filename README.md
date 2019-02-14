# Backup all private and public snippets from gitlab

```
export GITLAB_URL=<URL of gitlab server>
export GITLAB_TOKEN=<Your private token>
git clone https://github.com/ghafran/gitlab-snippets-backup.git
cd gitlab-snippets-backup
npm install
node private.js
node public.js
```
