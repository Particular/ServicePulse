import { describe, expect, test } from "vitest";
import { render, screen } from "@component-test-utils";
import ExternalLink from "@/components/ExternalLink.vue";

describe("ExternalLink", () => {
  test("renders a target blank link with default rel values", () => {
    render(ExternalLink, {
      props: {
        href: "https://docs.particular.net",
      },
      slots: {
        default: "Documentation",
      },
    });

    const link = screen.getByRole("link", { name: "Documentation" });
    expect(link).toHaveAttribute("href", "https://docs.particular.net");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("passes through attributes and does not render an icon by default", () => {
    const { container } = render(ExternalLink, {
      props: {
        href: "https://particular.net",
      },
      attrs: {
        id: "support-link",
        class: "btn btn-primary",
        "aria-label": "Support",
      },
      slots: {
        default: "Support",
      },
    });

    const link = screen.getByRole("link", { name: "Support" });
    expect(link).toHaveAttribute("id", "support-link");
    expect(link).toHaveAttribute("aria-label", "Support");
    expect(link).toHaveClass("btn", "btn-primary");
    expect(container.querySelector(".external-link-icon")).toBeNull();
  });

  test("renders an icon when showIcon is enabled", () => {
    const { container } = render(ExternalLink, {
      props: {
        href: "https://particular.net",
        showIcon: true,
        iconClass: "small",
      },
      slots: {
        default: "Customer Portal",
      },
    });

    expect(screen.getByRole("link", { name: "Customer Portal" })).toBeInTheDocument();
    expect(container.querySelector(".external-link-icon")).not.toBeNull();
    expect(container.querySelector(".external-link-icon")).toHaveClass("small");
  });
});
