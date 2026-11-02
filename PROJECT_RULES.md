# Petal: Persistent Project Rules

## Data Sanctity & Preservation Rules
1. **Never delete, reset, migrate destructively or overwrite anything in the data folder.**
2. **Never add sample data, hard-coded seed decks, or fake fixtures into production code paths.**
3. **Never modify existing user materials when changing code.**
4. **All database migrations must be versioned and ADDITIVE ONLY.**
5. **Always preserve uploaded user files in their dedicated directory outside the repository (`~/PetalData`).**
6. **Ask the user explicitly before making any change that touches data storage or alters user materials.**
