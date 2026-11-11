# usage-bar

A Claude Code mod that keeps your 5-hour and weekly usage limits on screen. It draws a band above the prompt box and a matching status line:

```
5 saat ███░░░░░░░ %32 (2s 15dk)   Haftalık ██████░░░░ %61 (3g 4s)
```

The text in parentheses is the time left until that limit resets. Each limit turns yellow at 70% and red at 90%. The figures come from Claude's own rate-limit readings. They refresh after every reply and whenever a limit moves by a full point. The band shows only on a subscription; API-key sessions report no limits.

## Install

At the prompt of a terminal session:

```
/plugin install usage-bar --marketplace 4chil/claude-usage-bar
```

From a shell:

```bash
claude plugin install usage-bar --marketplace 4chil/claude-usage-bar
```

Answer `y` to add the marketplace, then choose the user scope so the mod loads in every session.

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `4chil/claude-usage-bar`, then Add plugin.
