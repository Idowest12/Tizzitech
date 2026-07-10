const fs = require('fs');
let code = fs.readFileSync('src/components/NewsletterAdmin.tsx', 'utf-8');

const target = `                    <div className="text-white text-sm font-medium">{sub.email}</div>
                    <div className="text-neutral-500 text-xs">
                      {new Date(sub.subscribedAt).toLocaleString()}
                    </div>
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest \${
                    sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-800 text-neutral-400'
                  }\`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>`;

const replacement = `                    <div className="text-white text-sm font-medium">{sub.email}</div>
                    <div className="text-neutral-500 text-xs">
                      {new Date(sub.subscribedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={\`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest \${
                      sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-800 text-neutral-400'
                    }\`}>
                      {sub.status}
                    </span>
                    {sub.welcomeEmailSent === true && (
                      <span className="text-[10px] text-blue-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Email Sent
                      </span>
                    )}
                    {sub.welcomeEmailSent === false && sub.emailError && (
                      <span className="text-[10px] text-red-400 flex items-center gap-1" title={sub.emailError}>
                        <AlertCircle className="w-3 h-3" /> Email Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/NewsletterAdmin.tsx', code);
