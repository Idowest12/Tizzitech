const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `      } catch (err) {
        console.error("Error fetching", err);
      }
        
      } catch (err) {
        console.error("Failed to load products from database:", err);
      }`,
  `      } catch (err) {
        console.error("Error fetching", err);
      }`
);

fs.writeFileSync('src/App.tsx', code);
