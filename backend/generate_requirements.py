#!/usr/bin/env python3
"""
Generate requirements.txt and requirements-dev.txt from pyproject.toml using poetry.
"""
import subprocess
import sys


def main():
    """Generate requirements files using poetry."""
    try:
        # Generate requirements.txt (production dependencies only)
        print("Generating libraries/requirements.txt...")
        subprocess.run(
            [
                "poetry",
                "export",
                "-f",
                "requirements.txt",
                "--output",
                "libraries/requirements.txt",
                "--without-hashes",
                "--without",
                "dev",
            ],
            check=True,
            cwd="/home/runner/work/vibe_coding_test1/vibe_coding_test1/backend",
        )
        print("✓ Generated libraries/requirements.txt")

        # Generate requirements-dev.txt (all dependencies including dev)
        print("Generating libraries/requirements-dev.txt...")
        subprocess.run(
            [
                "poetry",
                "export",
                "-f",
                "requirements.txt",
                "--output",
                "libraries/requirements-dev.txt",
                "--without-hashes",
                "--with",
                "dev",
            ],
            check=True,
            cwd="/home/runner/work/vibe_coding_test1/vibe_coding_test1/backend",
        )
        print("✓ Generated libraries/requirements-dev.txt")

        print("\n✓ Successfully generated all requirements files!")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"✗ Error generating requirements files: {e}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"✗ Unexpected error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
