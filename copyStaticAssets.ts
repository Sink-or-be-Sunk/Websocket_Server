import * as shell from "shelljs";

shell.cp("-R", "src/public/lib", "dist/public/");
shell.cp("-R", "src/public/fonts", "dist/public/");
shell.cp("-R", "src/public/images", "dist/public/");
shell.cp("-R", "3D_Assets", "dist/public/");
