# StudyHub-IL Use Case Diagram

This directory contains the Use Case diagram for the StudyHub-IL collaborative study platform.

## Files

- **`use-case-diagram.puml`** - PlantUML source code for the Use Case diagram
- **`StudyHub-IL-UseCase.png`** - PNG export of the Use Case diagram
- **`StudyHub-IL-UseCase.svg`** - SVG export of the Use Case diagram
- **`azure-devops-work-items.md`** - Mapping of Use Cases to Azure DevOps Features, User Stories, and Tasks

## Use Case Diagram Overview

The diagram illustrates the main functionality of the StudyHub-IL platform with four types of actors:

### Actors

1. **אורח (Guest)** - Unauthenticated visitors
2. **סטודנט רשום (Registered Student)** - Authenticated students
3. **מנהל (Moderator)** - Content moderators
4. **מנהל מערכת (Admin)** - System administrators

### Use Cases

The system boundary "StudyHub - IL" contains the following use cases:

1. **הרשמה / התחברות** (Registration / Login) - User authentication
2. **חיפוש/עיון בסיכומים** (Search/Browse Summaries) - Find and view study materials
3. **העלאת/שיתוף סיכומים** (Upload/Share Summaries) - Share study materials with others
4. **יצירת/הצטרפות לדיון** (Create/Join Discussion) - Participate in forums
5. **איתור/התאמת שותף לימוד** (Find/Match Study Partner) - Find compatible study partners
6. **תיאום מפגש לימוד** (Schedule Study Meeting) - Coordinate study sessions
7. **דיווח על תוכן בלתי הולם** (Report Inappropriate Content) - Report policy violations

### Relationships

#### <<include>> Relationships
The following use cases require authentication (include the Authentication use case):
- העלאת/שיתוף סיכומים (Upload/Share Summaries)
- יצירת/הצטרפות לדיון (Create/Join Discussion)
- איתור/התאמת שותף לימוד (Find/Match Study Partner)
- תיאום מפגש לימוד (Schedule Study Meeting)

#### <<extend>> Relationship
- **דיווח על תוכן בלתי הולם** (Report Inappropriate Content) extends **חיפוש/עיון בסיכומים** (Browse Summaries) - Users can optionally report content while browsing

## Generating the Diagrams

If you need to regenerate the diagrams from the PlantUML source:

### Prerequisites
- Java Runtime Environment (JRE)
- PlantUML JAR file
- Graphviz (for rendering)

### Installation

#### Option 1: Local Installation (Command Line)
```bash
# Install Graphviz (required for rendering)
# Ubuntu/Debian:
sudo apt-get install graphviz

# macOS:
brew install graphviz

# Download PlantUML JAR
wget https://github.com/plantuml/plantuml/releases/latest/download/plantuml.jar
```

#### Option 2: VS Code Extension
Install the "PlantUML" extension by jebbs in VS Code for inline preview and export.

#### Option 3: Online PlantUML Server
Visit http://www.plantuml.com/plantuml/ and paste the `.puml` file contents.

### Commands

```bash
# Generate PNG
java -jar plantuml.jar -tpng use-case-diagram.puml

# Generate SVG
java -jar plantuml.jar -tsvg use-case-diagram.puml
```

## Azure DevOps Integration

The `azure-devops-work-items.md` file provides a comprehensive breakdown of how each Use Case maps to:
- **Features** - One Feature per Use Case
- **User Stories** - Multiple User Stories per Feature
- **Tasks** - Specific implementation tasks for each User Story

This mapping can be used to create a complete work item hierarchy in Azure DevOps for project planning and tracking.

### Summary Statistics
- Total Features: 7
- Total User Stories: 23
- Total Tasks: 178

## Usage

### Viewing the Diagram
- Open `StudyHub-IL-UseCase.png` for a raster image view
- Open `StudyHub-IL-UseCase.svg` for a scalable vector view (recommended for documentation)

### Editing the Diagram
1. Edit the `use-case-diagram.puml` file
2. Regenerate the PNG/SVG using the commands above
3. Commit all three files together

## Notes

- All labels are in Hebrew to match the target audience
- The diagram follows UML Use Case diagram conventions
- RTL (Right-to-Left) text direction is considered in the design
- The diagram serves as a foundation for system requirements and development planning
