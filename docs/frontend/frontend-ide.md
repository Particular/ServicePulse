# Setting up your IDE

- [Setting up your IDE](#setting-up-your-ide)
  - [Webstorm](#webstorm)
    - [Configuration](#configuration)
      - [Keymap](#keymap)
      - [Other settings](#other-settings)
  - [VSCode](#vscode)
    - [ESLint](#eslint)

Although we don't prescribe the tools you use to develop the portal, we strongly recommend using Webstorm.

The out of the box experience with both Webstorm and VSCode should be quite good for our code base, but you may need some extra tweaks to get things working as smoothly as possible.

## Webstorm

### Configuration

A lot of the project-specific settings in webstorm are committed to our git repository, and you should inherit this configuration automatically. Some optional settings you may want to consider are listed below.  
By default we recommend the following settings for both ESlint and Prettier.
![ESlint](webstorm-eslint.png)
![Prettier](webstorm-prettier.png)

#### Keymap

You can change your KeyMap under `File | Settings | Keymap`. A good option is the `Visual Studio` keymap, as this will give you consistent keyboard shortcuts with Visual Studio / Rider, and is also the most commonly used keymap by developers at Particular.

#### Other settings

- To improve the quality of suggestions you receive when using code completion, go to `File | Settings | Editor | General | Code Completion` and enable `Only type-based completion`.

## VSCode

### ESLint

Install the `ESLint` extension found here - [https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

If you want to apply any eslint changes (including prettier formatting rules) when saving, enable the following user setting:

```json
{
  "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
  }
}
```