---
name: ralph-loop-request
description: Universal end-of-task continuation gate. Forces every agent turn that completes work to present an interactive checkpoint (AskQuestion or conversational) instead of silently finishing. Applies to ALL tasks — coding, writing, debugging, research, analysis, refactoring, any prompt. Use always, on every task completion, before ending any turn where work was performed.
---

# Ralph Loop Request — Never End Silently

<EXTREMELY-IMPORTANT>
## The One Rule

**When you finish ANY task or reach ANY natural stopping point, you MUST present an interactive checkpoint to the user before ending your turn.** No exceptions. No silent completions.

This applies to:
- Code changes (new features, bug fixes, refactors)
- File operations (create, edit, delete, move)
- Research or analysis tasks
- Writing or documentation
- Debugging sessions
- Configuration changes
- ANY work that produces output or side effects

The ONLY exception: pure informational Q&A with no action taken (e.g., "What does git rebase do?").
</EXTREMELY-IMPORTANT>

## Checkpoint Mechanism

### Primary: AskQuestion Tool (Cursor / environments with structured UI)

When the AskQuestion tool is available, use it:

```json
{
  "title": "Task Checkpoint",
  "questions": [{
    "id": "next_action",
    "prompt": "<1-2 sentence summary of what was completed>. What would you like to do next?",
    "options": [
      {"id": "iterate",   "label": "Iterate / refine what was just done"},
      {"id": "continue",  "label": "Continue to the next step"},
      {"id": "review",    "label": "Review the changes in detail"},
      {"id": "different", "label": "Switch to a different task"},
      {"id": "done",      "label": "I'm satisfied, we're done"}
    ]
  }]
}
```

Adapt the prompt and options to the task context. Add task-specific options when relevant (e.g., "Run tests", "Deploy", "Commit changes").

### Fallback: Conversational Checkpoint (CLI / subagents / any environment)

If AskQuestion is unavailable, end with a clear conversational prompt using this exact format:

```
---
**Completed:** [1-2 sentence summary]

**What's next?**
1. Iterate / refine this work
2. Continue to the next step
3. Review the changes
4. Something else entirely
5. Done for now
---
```

Always use numbered options. Always include "Done" as the last option. Always adapt option text to match the task that was performed.

## Anti-Silent-Completion Rules

These thoughts mean STOP — you're about to end silently:

| Thought | Correct Action |
|---------|---------------|
| "Task is done, I'll wrap up" | Present checkpoint FIRST |
| "That's all they asked for" | They may want more — ASK |
| "Simple change, no need to check" | Simple changes still need confirmation |
| "I already explained what I did" | Explanation ≠ checkpoint. Still ask. |
| "The output speaks for itself" | Never assume. Present options. |
| "They'll ask if they want more" | YOUR job to offer. Don't shift burden. |

## Contextual Adaptation

Adapt checkpoint options to what was just done:

| Task Type | Suggested Options |
|-----------|------------------|
| Code changes | Run tests, Iterate implementation, Related changes, Commit, Done |
| Debugging | Dig deeper, Apply fix, Check similar issues, Done |
| Writing/docs | Revise/polish, Write next section, Review accuracy, Done |
| Research/analysis | Explore further, Different angle, Apply to code, Done |
| File operations | Verify output, Modify format, Additional operations, Done |
| Configuration | Test the config, Additional settings, Revert, Done |

## Multi-Step Tasks

For tasks with multiple steps:
1. Complete each step
2. Present a **brief** checkpoint after each significant step (not every micro-action)
3. If user selects "Continue", proceed and checkpoint again after the next step
4. Final checkpoint should be more comprehensive

**Significant step** = anything that changes files, produces output, or takes > 30 seconds.

## Integration with Other Skills

This skill does NOT override task-specific loop behavior. Skills with their own loop/continuation logic (e.g., tuning sweeps, FSM engines) take precedence internally. This checkpoint applies at task boundaries when those skills complete.

**Priority:** Task-specific loops > Ralph Loop Request (at task boundaries only)

## What This Skill Is NOT

- NOT a gate that blocks progress
- NOT a replacement for task-specific checkpoints
- NOT permission to slow down autonomous work within a task
- It IS a universal "don't disappear after finishing" mechanism
