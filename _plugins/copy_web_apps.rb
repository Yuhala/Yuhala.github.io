# Copy apps/ into the built site after Jekyll finishes.
# The folder is excluded from Jekyll so terser does not rewrite the JS.
require "fileutils"

Jekyll::Hooks.register :site, :post_write do |site|
  source = File.join(site.source, "apps")
  destination = File.join(site.dest, "apps")
  next unless File.directory?(source)

  FileUtils.mkdir_p(destination)
  FileUtils.cp_r(File.join(source, "."), destination)
end
