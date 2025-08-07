export default {
  extends: "semantic-release-monorepo",
  tagFormat: "${packageName}-v${version}",
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/github"
  ]
}
