import type { Rule } from "eslint";

/**
 * ESLint rule to disallow raw fetch() calls.
 * Use authFetch from useAuthenticatedFetch.ts instead.
 */
const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow raw fetch() calls. Use authFetch from useAuthenticatedFetch.ts instead.",
    },
    messages: {
      noRawFetch: "Do not use raw fetch(). Use authFetch from '@/composables/useAuthenticatedFetch' instead.",
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      CallExpression(node) {
        // Check if it's a call to `fetch`
        if (node.callee.type === "Identifier" && node.callee.name === "fetch") {
          // Check if this file is the useAuthenticatedFetch composable itself
          const filename = context.filename;
          if (filename.includes("useAuthenticatedFetch")) {
            return; // Allow fetch in the wrapper file itself
          }

          // Check if `fetch` is a local variable/parameter (not the global)
          const scope = sourceCode.getScope(node);
          const variable = scope.references.find((ref) => ref.identifier === node.callee);
          if (variable && variable.resolved && variable.resolved.defs.length > 0) {
            return; // It's a local variable, not the global fetch
          }

          context.report({
            node,
            messageId: "noRawFetch",
          });
        }
      },
    };
  },
};

export default rule;
