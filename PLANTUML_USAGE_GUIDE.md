# PlantUML Use Case Diagram - Usage Guide

## Quick Start

### Option 1: Online PlantUML Server (Easiest)
1. Go to: **http://www.plantuml.com/plantuml/uml/**
2. Copy the entire contents of `USE_CASE_DIAGRAM.puml`
3. Paste into the online editor
4. The diagram will render automatically
5. Right-click on the diagram → "Save image as..." → Save as PNG or SVG

### Option 2: VS Code Extension
1. Install **PlantUML** extension in VS Code
2. Install Java (required for PlantUML)
3. Open `USE_CASE_DIAGRAM.puml` in VS Code
4. Press `Alt + D` (or right-click → "Preview PlantUML")
5. Export: Right-click on preview → "Export Current Diagram"

### Option 3: Command Line
1. Install PlantUML: `npm install -g node-plantuml` or download from http://plantuml.com/download
2. Install Java Runtime Environment (JRE)
3. Run: `plantuml USE_CASE_DIAGRAM.puml`
4. This generates `USE_CASE_DIAGRAM.png`

### Option 4: IntelliJ IDEA / PyCharm
1. Install **PlantUML integration** plugin
2. Open `USE_CASE_DIAGRAM.puml`
3. Right-click → "PlantUML" → "Generate Diagram"
4. Export from the preview window

## Files Available

1. **USE_CASE_DIAGRAM.puml** - Full detailed diagram with all use cases
2. **USE_CASE_DIAGRAM_SIMPLE.puml** - Simplified version (fewer use cases, cleaner layout)

## Diagram Features

### Actors
- **Regular User** - End users who browse and book packages
- **Travel Agency** - Agencies that create and manage packages
- **Administrator** - System administrators who manage the platform

### Use Case Categories
- **Authentication** - Login, registration, password management
- **User Features** - Browsing, booking, wishlist, profile management
- **Agency Features** - Package creation, management, bookings
- **Admin Features** - Approval workflows, user management, statistics

### Relationships
- **Solid arrows (-->)**: Direct association between actor and use case
- **Dotted arrows (.>) with <<include>>**: One use case always includes another
- **Dotted arrows (.>) with <<extend>>**: One use case optionally extends another

## Customization

### Change Colors
Edit these lines in the .puml file:
```plantuml
skinparam actor {
  BackgroundColor #E1F5FF
  BorderColor #0066CC
}

skinparam usecase {
  BackgroundColor #FFF4E6
  BorderColor #FF8C00
}
```

### Change Layout
- `left to right direction` - Horizontal layout (current)
- `top to bottom direction` - Vertical layout
- Remove direction line - Automatic layout

### Add/Remove Use Cases
Simply add or remove usecase lines:
```plantuml
usecase "Your Use Case Name" as UCXX
```

Then connect to actors:
```plantuml
User --> UCXX
```

## Export Options

### PNG (Best for Reports)
- High resolution
- Good for printing
- Large file size

### SVG (Best for Web)
- Scalable vector graphics
- Small file size
- Perfect for presentations

### PDF (Best for Documents)
- Vector format
- Professional appearance
- Easy to embed in reports

## Troubleshooting

### Diagram Not Rendering
1. Check Java is installed: `java -version`
2. Verify PlantUML syntax (no typos)
3. Try the online server first

### Diagram Too Large
- Use `USE_CASE_DIAGRAM_SIMPLE.puml` instead
- Remove some use cases
- Split into multiple diagrams

### Colors Not Showing
- Check skinparam settings
- Some renderers may not support all colors
- Try online PlantUML server

## For Academic Reports

### Recommended Settings
1. Use **PNG format** at 300 DPI for printing
2. Use **SVG format** for digital reports
3. Add figure caption: "Figure X.X: Use Case Diagram for TravelEase System"
4. Include legend explaining relationships
5. Reference diagram in text when discussing features

### Example Caption
```
Figure 3.1: Use Case Diagram for TravelEase System

The diagram illustrates three main actors (Regular User, Travel Agency, and Administrator) 
and their interactions with the system. Solid arrows represent direct associations, 
dotted arrows with <<include>> represent mandatory relationships, and dotted arrows 
with <<extend>> represent optional extensions.
```

## Tips

1. **Start Simple**: Use the simple version first, then add details
2. **Test Online**: Always test on PlantUML online server first
3. **Version Control**: Keep both simple and detailed versions
4. **Documentation**: Document any customizations you make
5. **Backup**: Keep a backup of working versions

## Support

- PlantUML Documentation: http://plantuml.com/guide
- PlantUML Examples: http://plantuml.com/use-case-diagram
- Online Editor: http://www.plantuml.com/plantuml/uml/






