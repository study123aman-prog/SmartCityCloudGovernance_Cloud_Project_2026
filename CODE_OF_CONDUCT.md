# Code of Conduct

## Intelligent Cloud-Based Fire-Safety Compliance Verification

### 1. Purpose

This Code of Conduct establishes the expected standards for participation in this project repository.

The project is a collaborative academic and research-oriented project. All contributors are expected to communicate respectfully, work honestly, document their contributions, and maintain a professional environment.

---

## 2. Expected Behaviour

All contributors are expected to:

* Treat other team members and contributors with respect.
* Communicate professionally and constructively.
* Listen to different technical opinions and research perspectives.
* Provide constructive feedback during code and document reviews.
* Clearly document important technical decisions.
* Give appropriate credit to the work of other contributors.
* Follow the project's Git and GitHub workflow.
* Keep commits meaningful and descriptive.
* Review pull requests responsibly.
* Report bugs, security concerns, and research issues honestly.
* Distinguish verified facts from assumptions or hypotheses.
* Cite external research, datasets, papers, patents, and other sources appropriately.
* Respect applicable licenses when using external code, datasets, models, or resources.
* Protect credentials, API keys, personal information, and other sensitive information.

---

## 3. Research Integrity

Because this project involves research and prior-art analysis, contributors must maintain academic and research integrity.

Contributors should:

* Never fabricate research results.
* Never invent papers, patents, datasets, experiments, or citations.
* Clearly identify assumptions and simulated results.
* Clearly distinguish experimental results from expected results.
* Report unsuccessful experiments rather than selectively hiding them.
* Avoid claiming that the proposed mechanism is definitely novel or patentable without appropriate verification.
* Properly attribute ideas and technologies obtained from external sources.
* Avoid copying substantial material from papers or other projects without appropriate attribution.

The project should use terms such as:

> "proposed mechanism"

> "research hypothesis"

> "potentially differentiated"

> "requires further prior-art verification"

when the relevant claim has not been independently established.

---

## 4. Fire-Safety and Technical Responsibility

This project is an academic prototype and must not be treated as a certified fire-safety control system.

The prototype may use:

* simulated sensor data;
* simulated fire-safety events;
* sample images;
* controlled test scenarios;
* software-generated compliance events.

Prototype results must not be represented as certification of a real building's fire-safety compliance.

No contributor should intentionally disable, interfere with, or manipulate a real fire-protection system as part of this project.

Real-world fire-safety decisions must remain subject to applicable regulations, qualified professionals, and certified safety systems.

---

## 5. GitHub Collaboration

Contributors should follow the repository's established development workflow.

Recommended workflow:

```text
main
  │
  └── develop
        │
        ├── feature/contributor-1
        ├── feature/contributor-2
        └── feature/contributor-3
```

Contributors should:

1. Create or work on an appropriate feature branch.
2. Make focused and meaningful commits.
3. Push changes regularly.
4. Create a pull request when work is ready for review.
5. Respond to review comments constructively.
6. Resolve merge conflicts carefully.
7. Merge changes only after appropriate review.
8. Avoid committing credentials or unnecessary generated files.

---

## 6. Commit Standards

Commit messages should clearly describe the change.

### Good examples

```text
Add remediation attribution rule engine

Implement evidence sufficiency validation

Add fire door verification workflow

Update compliance state model

Add false-resolution evaluation metrics
```

### Avoid

```text
update

changes

final

final2

fixed stuff
```

Meaningful commit history helps document the development process and individual contributions.

---

## 7. Pull Request Guidelines

Pull requests should:

* Have a clear title.
* Explain what was changed.
* Explain why the change was necessary.
* Identify relevant tests or validation performed.
* Include screenshots or diagrams when appropriate.
* Avoid unrelated changes.
* Be reviewed before merging into the shared development branch.

For research-related changes, the pull request should also identify relevant sources where appropriate.

---

## 8. Intellectual Property and Attribution

Contributors must respect the intellectual property of others.

When using:

* research papers;
* open-source libraries;
* datasets;
* pretrained models;
* AWS examples;
* external documentation;
* code snippets;
* patents or technical disclosures;

the source and applicable license should be acknowledged where required.

No contributor should claim another person's work as their own.

The project's proposed invention concepts should also be documented with clear authorship and contribution records.

---

## 9. Security

Contributors must not commit:

* AWS access keys;
* API keys;
* passwords;
* authentication tokens;
* private certificates;
* personal credentials;
* confidential organizational information.

Use environment variables or appropriate secret-management mechanisms instead.

If a credential is accidentally committed, it should be revoked or rotated immediately.

---

## 10. Unacceptable Behaviour

The following behaviours are not acceptable:

* Harassment or personal attacks.
* Discrimination or hateful conduct.
* Deliberate disruption of another contributor's work.
* Intentionally introducing malicious code.
* Sharing private information without permission.
* Fabricating research results.
* Fabricating citations or experimental evidence.
* Deliberately misrepresenting project results.
* Plagiarism.
* Committing credentials or secrets intentionally.
* Tampering with real fire-safety infrastructure.
* Using the project to conduct unauthorized testing against third-party systems.

---

## 11. Reporting Problems

If a contributor encounters:

* inappropriate behaviour;
* security problems;
* research-integrity concerns;
* plagiarism;
* fabricated results;
* unauthorized use of project resources;

they should report the issue to the project maintainers or the appropriate course/project supervisor.

Security vulnerabilities involving credentials or deployed infrastructure should be reported privately rather than through a public GitHub issue.

---

## 12. Enforcement

Project maintainers may take appropriate action when this Code of Conduct is violated.

Depending on the situation, actions may include:

* requesting changes;
* removing inappropriate content;
* rejecting a pull request;
* restricting repository participation;
* escalating serious issues to the project supervisor or relevant institution.

Actions should be applied fairly and proportionately.

---

## 13. Scope

This Code of Conduct applies to:

* GitHub issues;
* pull requests;
* repository discussions;
* project documentation;
* code reviews;
* project meetings;
* project-related communication;
* other project activities where contributors represent the project.

---

## 14. Final Principle

The project should maintain three standards throughout development:

### Technical honesty

> Do not claim that the system does more than it has actually demonstrated.

### Research honesty

> Do not present an assumption, inference, or hypothesis as a verified fact.

### Professional collaboration

> Challenge ideas and implementations, not the people proposing them.
